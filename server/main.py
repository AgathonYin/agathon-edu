import asyncio
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Literal

import asyncpg
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class AiReviewRequest(BaseModel):
    mode: Literal["review", "exercise", "rubric"]
    source: str


class AiReviewResponse(BaseModel):
    provider: str
    feedback: str


class ExerciseCreateRequest(BaseModel):
    knowledge_point_id: str | None = None
    source: str
    difficulty: Literal["初级", "中级", "高级"] = "中级"
    exercise_type: str = "翻译练习"


class ExerciseResponse(BaseModel):
    id: str
    knowledge_point_id: str | None = None
    title: str
    prompt: str
    difficulty: str
    exercise_type: str
    reference_answer: str | None = None
    created_at: str


class SubmissionCreateRequest(BaseModel):
    exercise_id: str | None = None
    student_id: str | None = None
    student_name: str = "访客学生"
    answer: str
    source: str | None = None


class SubmissionResponse(BaseModel):
    id: str
    exercise_id: str | None = None
    student_name: str
    answer: str
    status: str
    score: float | None = None
    ai_feedback: str
    provider: str
    created_at: str


class KnowledgePointResponse(BaseModel):
    id: str
    title: str
    module: str
    week: int
    tags: list[str]
    mastery: int = Field(default=0, ge=0, le=100)
    description: str


class CourseWeekPayload(BaseModel):
    id: int
    module: str
    mode: str
    title: str
    summary: str
    route: str | None = None
    status: Literal["ready", "planned"] = "planned"


class KnowledgePointPayload(BaseModel):
    id: str
    title: str
    module: str
    week: int
    tags: list[str] = []
    mastery: int = Field(default=0, ge=0, le=100)
    description: str


class KnowledgeEdgePayload(BaseModel):
    source_id: str
    target_id: str
    label: str | None = None


class CourseContentPayload(BaseModel):
    weeks: list[CourseWeekPayload] = []
    knowledge_points: list[KnowledgePointPayload] = []
    knowledge_edges: list[KnowledgeEdgePayload] = []


class CourseMaterialPayload(BaseModel):
    title: str
    category: str
    material_type: str
    week: int | None = None
    source_path: str
    summary: str | None = None
    content: str | None = None
    metadata: dict[str, Any] = {}


class CourseMaterialsImportPayload(BaseModel):
    materials: list[CourseMaterialPayload]


class LoginRequest(BaseModel):
    email: str
    name: str
    class_name: str | None = None
    role: Literal["student", "teacher"] = "student"


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    class_name: str | None = None


class LearningEventRequest(BaseModel):
    user_id: str
    event_type: Literal["login", "knowledge_view", "lesson_view", "ai_review", "submission"]
    target_id: str | None = None
    metadata: dict[str, Any] = {}


app = FastAPI(title="Agathon Edu API")
db_pool: asyncpg.Pool | None = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://127.0.0.1:5173,http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


MEMORY_KNOWLEDGE: list[dict[str, Any]] = [
    {
        "id": "business-format",
        "title": "商务信函格式与社交距离",
        "module": "八·商务信函",
        "week": 13,
        "tags": ["商务文书", "礼貌策略"],
        "mastery": 43,
        "description": "将中文直接业务信息转换为日语商务文书的固定格式、缓冲表达和礼貌请求。",
    },
    {
        "id": "legal-conditions",
        "title": "契约条件嵌套的集合论逻辑",
        "module": "九·法规合同",
        "week": 15,
        "tags": ["場合", "とき", "法律逻辑"],
        "mastery": 37,
        "description": "以「場合」构建大前提，以「とき」指定触发事件，避免平级并列导致权利边界错误。",
    },
    {
        "id": "mtpe",
        "title": "MTPE 质量评估与人工干预",
        "module": "七·科技产品",
        "week": 12,
        "tags": ["MTPE", "MQM"],
        "mastery": 61,
        "description": "识别机器翻译的术语不一致、数字错误、否定遗漏和语体错配。",
    },
]

MEMORY_EXERCISES: list[dict[str, Any]] = [
    {
        "id": "demo-business-request",
        "knowledge_point_id": "business-format",
        "title": "商务付款请求改写",
        "prompt": "请将“请贵司于本月30日前支付尾款。”译为自然的日语商务邮件表达，并说明缓冲语处理。",
        "difficulty": "中级",
        "exercise_type": "商务信函",
        "reference_answer": "今月30日までに残金をお支払いいただけますようお願い申し上げます。",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
]
MEMORY_SUBMISSIONS: list[dict[str, Any]] = []
MEMORY_WEEKS: list[dict[str, Any]] = []
MEMORY_EDGES: list[dict[str, Any]] = []
MEMORY_USERS: list[dict[str, Any]] = []
MEMORY_EVENTS: list[dict[str, Any]] = []
MEMORY_USER_ACHIEVEMENTS: list[dict[str, Any]] = []

ACHIEVEMENTS = [
    {
        "code": "first-login",
        "title": "初次登录",
        "description": "第一次进入学习中心并建立学习档案。",
        "icon": "入",
        "rule": "login >= 1",
    },
    {
        "code": "graph-explorer",
        "title": "图谱探索者",
        "description": "查看 3 个不同知识点。",
        "icon": "图",
        "rule": "distinct knowledge_view target_id >= 3",
    },
    {
        "code": "ai-practice",
        "title": "AI 陪练启动",
        "description": "完成第一次 AI 点评或练习生成。",
        "icon": "AI",
        "rule": "ai_review >= 1",
    },
    {
        "code": "first-submission",
        "title": "首份提交",
        "description": "提交第一份练习作业。",
        "icon": "交",
        "rule": "submission >= 1",
    },
    {
        "code": "steady-learner",
        "title": "稳定学习者",
        "description": "累计记录 8 次学习行为。",
        "icon": "稳",
        "rule": "events >= 8",
    },
]


@app.on_event("startup")
async def startup() -> None:
    global db_pool
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return

    for _ in range(20):
        try:
            db_pool = await asyncpg.create_pool(database_url, min_size=1, max_size=5)
            await ensure_schema()
            return
        except Exception:
            await asyncio.sleep(1)
    db_pool = None


@app.on_event("shutdown")
async def shutdown() -> None:
    if db_pool:
        await db_pool.close()


@app.get("/api/health")
async def health():
    return {"ok": True, "database": db_pool is not None, "provider": os.getenv("AI_PROVIDER", "mock")}


async def ensure_schema() -> None:
    if not db_pool:
        return
    await db_pool.execute(
        """
        alter table knowledge_points
        add column if not exists mastery int not null default 0 check (mastery >= 0 and mastery <= 100);

        create table if not exists course_weeks (
          id int primary key,
          module text not null,
          mode text not null,
          title text not null,
          summary text not null,
          route text,
          status text not null default 'planned' check (status in ('ready', 'planned')),
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        );

        create table if not exists knowledge_edges (
          id uuid primary key default gen_random_uuid(),
          source_id text not null references knowledge_points(id) on delete cascade,
          target_id text not null references knowledge_points(id) on delete cascade,
          label text,
          created_at timestamptz not null default now(),
          unique (source_id, target_id)
        );

        create index if not exists idx_course_weeks_status on course_weeks(status);
        create index if not exists idx_knowledge_edges_source on knowledge_edges(source_id);
        create index if not exists idx_knowledge_edges_target on knowledge_edges(target_id);

        create table if not exists learning_events (
          id uuid primary key default gen_random_uuid(),
          user_id uuid not null references users(id) on delete cascade,
          event_type text not null check (event_type in ('login', 'knowledge_view', 'lesson_view', 'ai_review', 'submission')),
          target_id text,
          metadata jsonb not null default '{}'::jsonb,
          created_at timestamptz not null default now()
        );

        create table if not exists achievements (
          code text primary key,
          title text not null,
          description text not null,
          icon text not null,
          rule text not null,
          created_at timestamptz not null default now()
        );

        create table if not exists user_achievements (
          user_id uuid not null references users(id) on delete cascade,
          achievement_code text not null references achievements(code) on delete cascade,
          awarded_at timestamptz not null default now(),
          primary key (user_id, achievement_code)
        );

        create index if not exists idx_learning_events_user on learning_events(user_id);
        create index if not exists idx_learning_events_type on learning_events(event_type);

        create table if not exists course_materials (
          id uuid primary key default gen_random_uuid(),
          title text not null,
          category text not null,
          material_type text not null,
          week int,
          source_path text unique not null,
          summary text,
          content text,
          metadata jsonb not null default '{}'::jsonb,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        );

        create index if not exists idx_course_materials_week on course_materials(week);
        create index if not exists idx_course_materials_category on course_materials(category);
        """
    )
    for achievement in ACHIEVEMENTS:
        await db_pool.execute(
            """
            insert into achievements (code, title, description, icon, rule)
            values ($1, $2, $3, $4, $5)
            on conflict (code) do update set
              title = excluded.title,
              description = excluded.description,
              icon = excluded.icon,
              rule = excluded.rule
            """,
            achievement["code"],
            achievement["title"],
            achievement["description"],
            achievement["icon"],
            achievement["rule"],
        )


@app.post("/api/auth/login", response_model=UserResponse)
async def login(payload: LoginRequest):
    email = payload.email.strip().lower()
    if not db_pool:
        existing = next((item for item in MEMORY_USERS if item["email"] == email), None)
        user = existing or {"id": str(uuid.uuid4()), "email": email, "name": payload.name, "role": payload.role, "class_name": payload.class_name}
        user.update({"name": payload.name, "role": payload.role, "class_name": payload.class_name})
        replace_memory(MEMORY_USERS, user, "email")
        await record_learning_event(LearningEventRequest(user_id=user["id"], event_type="login"))
        return user

    row = await db_pool.fetchrow(
        """
        insert into users (email, name, role, class_name)
        values ($1, $2, $3, $4)
        on conflict (email) do update set
          name = excluded.name,
          role = excluded.role,
          class_name = excluded.class_name
        returning id::text, email, name, role, class_name
        """,
        email,
        payload.name.strip() or email,
        payload.role,
        payload.class_name,
    )
    user = serialize_record(row)
    await record_learning_event(LearningEventRequest(user_id=user["id"], event_type="login"))
    return user


@app.post("/api/learning-events")
async def record_learning_event(payload: LearningEventRequest):
    if not db_pool:
        MEMORY_EVENTS.append({**payload.model_dump(), "id": str(uuid.uuid4()), "created_at": now_iso()})
        await award_achievements(payload.user_id)
        return {"ok": True}

    await db_pool.execute(
        """
        insert into learning_events (user_id, event_type, target_id, metadata)
        values ($1::uuid, $2, $3, $4::jsonb)
        """,
        payload.user_id,
        payload.event_type,
        payload.target_id,
        json.dumps(payload.metadata, ensure_ascii=False),
    )
    await award_achievements(payload.user_id)
    return {"ok": True}


@app.get("/api/students/{user_id}/dashboard")
async def student_dashboard(user_id: str):
    if not db_pool:
        user_events = [item for item in MEMORY_EVENTS if item["user_id"] == user_id]
        earned = [item for item in MEMORY_USER_ACHIEVEMENTS if item["user_id"] == user_id]
        return memory_student_dashboard(user_events, earned)

    stats = await db_pool.fetchrow(
        """
        select
          count(*) as event_count,
          count(*) filter (where event_type = 'knowledge_view') as knowledge_views,
          count(distinct target_id) filter (where event_type = 'knowledge_view') as knowledge_count,
          count(*) filter (where event_type = 'submission') as submissions,
          count(*) filter (where event_type = 'ai_review') as ai_reviews
        from learning_events
        where user_id = $1::uuid
        """,
        user_id,
    )
    badges = await db_pool.fetch(
        """
        select a.code, a.title, a.description, a.icon, ua.awarded_at
        from user_achievements ua
        join achievements a on a.code = ua.achievement_code
        where ua.user_id = $1::uuid
        order by ua.awarded_at desc
        """,
        user_id,
    )
    recent = await db_pool.fetch(
        """
        select event_type, target_id, created_at
        from learning_events
        where user_id = $1::uuid
        order by created_at desc
        limit 8
        """,
        user_id,
    )
    return {
        "stats": serialize_record(stats),
        "achievements": [serialize_record(row) for row in badges],
        "recent_events": [serialize_record(row) for row in recent],
        "available_achievements": ACHIEVEMENTS,
    }


@app.get("/api/teacher/analytics")
async def teacher_analytics():
    if not db_pool:
        return {"students": len(MEMORY_USERS), "events": len(MEMORY_EVENTS), "achievements": len(MEMORY_USER_ACHIEVEMENTS), "students_detail": []}

    totals = await db_pool.fetchrow(
        """
        select
          count(*) filter (where role = 'student') as students,
          (select count(*) from learning_events) as events,
          (select count(*) from user_achievements) as achievements,
          (select count(*) from submissions) as submissions
        from users
        """
    )
    students = await db_pool.fetch(
        """
        select
          u.id::text, u.name, u.email, u.class_name,
          count(le.id) as event_count,
          count(distinct le.target_id) filter (where le.event_type = 'knowledge_view') as knowledge_count,
          count(ua.achievement_code) as badge_count,
          max(le.created_at) as last_active
        from users u
        left join learning_events le on le.user_id = u.id
        left join user_achievements ua on ua.user_id = u.id
        where u.role = 'student'
        group by u.id, u.name, u.email, u.class_name
        order by last_active desc nulls last, u.created_at desc
        limit 30
        """
    )
    return {**serialize_record(totals), "students_detail": [serialize_record(row) for row in students]}


@app.get("/api/content")
async def content():
    if not db_pool:
        return {"weeks": MEMORY_WEEKS, "knowledge_points": MEMORY_KNOWLEDGE, "knowledge_edges": MEMORY_EDGES}

    weeks = await db_pool.fetch(
        """
        select id, module, mode, title, summary, route, status
        from course_weeks
        order by id
        """
    )
    points = await db_pool.fetch(
        """
        select id, title, module, week, tags, mastery, description
        from knowledge_points
        order by week, module, title
        """
    )
    edges = await db_pool.fetch(
        """
        select source_id, target_id, label
        from knowledge_edges
        order by source_id, target_id
        """
    )
    return {
        "weeks": [serialize_record(row) for row in weeks],
        "knowledge_points": [serialize_record(row) for row in points],
        "knowledge_edges": [serialize_record(row) for row in edges],
    }


@app.get("/api/materials")
async def materials():
    if not db_pool:
        return []
    rows = await db_pool.fetch(
        """
        select id::text, title, category, material_type, week, source_path, summary, content, metadata, updated_at
        from course_materials
        order by coalesce(week, 999), category, title
        limit 300
        """
    )
    return [serialize_record(row) for row in rows]


@app.post("/api/materials/import")
async def import_materials(payload: CourseMaterialsImportPayload):
    if not db_pool:
        return {"ok": True, "materials": len(payload.materials)}

    async with db_pool.acquire() as conn:
        async with conn.transaction():
            for item in payload.materials:
                await conn.execute(
                    """
                    insert into course_materials (title, category, material_type, week, source_path, summary, content, metadata)
                    values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
                    on conflict (source_path) do update set
                      title = excluded.title,
                      category = excluded.category,
                      material_type = excluded.material_type,
                      week = excluded.week,
                      summary = excluded.summary,
                      content = excluded.content,
                      metadata = excluded.metadata,
                      updated_at = now()
                    """,
                    item.title,
                    item.category,
                    item.material_type,
                    item.week,
                    item.source_path,
                    item.summary,
                    item.content,
                    json.dumps(item.metadata, ensure_ascii=False),
                )
    return {"ok": True, "materials": len(payload.materials)}


@app.post("/api/content/import")
async def import_content(payload: CourseContentPayload):
    if not db_pool:
        MEMORY_WEEKS[:] = [item.model_dump() for item in payload.weeks]
        MEMORY_KNOWLEDGE[:] = [item.model_dump() for item in payload.knowledge_points]
        MEMORY_EDGES[:] = [item.model_dump() for item in payload.knowledge_edges]
        return {"ok": True, "weeks": len(MEMORY_WEEKS), "knowledge_points": len(MEMORY_KNOWLEDGE), "knowledge_edges": len(MEMORY_EDGES)}

    async with db_pool.acquire() as conn:
        async with conn.transaction():
            for item in payload.weeks:
                await upsert_course_week(conn, item)
            for item in payload.knowledge_points:
                await upsert_knowledge_point(conn, item)
            for item in payload.knowledge_edges:
                await upsert_knowledge_edge(conn, item)
    return {"ok": True, "weeks": len(payload.weeks), "knowledge_points": len(payload.knowledge_points), "knowledge_edges": len(payload.knowledge_edges)}


@app.post("/api/course-weeks")
async def save_course_week(payload: CourseWeekPayload):
    if not db_pool:
        replace_memory(MEMORY_WEEKS, payload.model_dump(), "id")
        return payload
    async with db_pool.acquire() as conn:
        row = await upsert_course_week(conn, payload)
    return serialize_record(row)


@app.post("/api/knowledge-points", response_model=KnowledgePointResponse)
async def save_knowledge_point(payload: KnowledgePointPayload):
    if not db_pool:
        replace_memory(MEMORY_KNOWLEDGE, payload.model_dump(), "id")
        return payload
    async with db_pool.acquire() as conn:
        row = await upsert_knowledge_point(conn, payload)
    return serialize_record(row)


@app.post("/api/knowledge-edges")
async def save_knowledge_edge(payload: KnowledgeEdgePayload):
    if not db_pool:
        replace_memory(MEMORY_EDGES, payload.model_dump(), "source_id", "target_id")
        return payload
    async with db_pool.acquire() as conn:
        row = await upsert_knowledge_edge(conn, payload)
    return serialize_record(row)


@app.delete("/api/knowledge-edges/{source_id}/{target_id}")
async def delete_knowledge_edge(source_id: str, target_id: str):
    if not db_pool:
        MEMORY_EDGES[:] = [item for item in MEMORY_EDGES if not (item.get("source_id") == source_id and item.get("target_id") == target_id)]
        return {"ok": True}
    await db_pool.execute("delete from knowledge_edges where source_id = $1 and target_id = $2", source_id, target_id)
    return {"ok": True}


@app.get("/api/knowledge-points", response_model=list[KnowledgePointResponse])
async def knowledge_points():
    if not db_pool:
        return MEMORY_KNOWLEDGE

    rows = await db_pool.fetch(
        """
        select id, title, module, week, tags, mastery, description
        from knowledge_points
        order by week, module, title
        """
    )
    if not rows:
        return MEMORY_KNOWLEDGE

    return [serialize_record(row) for row in rows]


@app.get("/api/exercises", response_model=list[ExerciseResponse])
async def exercises():
    if not db_pool:
        return MEMORY_EXERCISES

    rows = await db_pool.fetch(
        """
        select id::text, knowledge_point_id, title, prompt, difficulty, exercise_type, reference_answer, created_at
        from exercises
        order by created_at desc
        limit 50
        """
    )
    return [serialize_record(row) for row in rows] or MEMORY_EXERCISES


@app.post("/api/exercises/generate", response_model=ExerciseResponse)
async def generate_exercise(payload: ExerciseCreateRequest):
    ai_result = await ai_review(AiReviewRequest(mode="exercise", source=payload.source))
    exercise = {
        "id": str(uuid.uuid4()),
        "knowledge_point_id": payload.knowledge_point_id,
        "title": title_from_source(payload.source),
        "prompt": ai_result.feedback,
        "difficulty": payload.difficulty,
        "exercise_type": payload.exercise_type,
        "reference_answer": None,
        "created_at": now_iso(),
    }

    if db_pool:
        row = await db_pool.fetchrow(
            """
            insert into exercises (knowledge_point_id, title, prompt, difficulty, exercise_type, reference_answer)
            values ($1, $2, $3, $4, $5, $6)
            returning id::text, knowledge_point_id, title, prompt, difficulty, exercise_type, reference_answer, created_at
            """,
            exercise["knowledge_point_id"],
            exercise["title"],
            exercise["prompt"],
            exercise["difficulty"],
            exercise["exercise_type"],
            exercise["reference_answer"],
        )
        return serialize_record(row)

    MEMORY_EXERCISES.insert(0, exercise)
    return exercise


@app.post("/api/submissions", response_model=SubmissionResponse)
async def create_submission(payload: SubmissionCreateRequest):
    source = payload.source or payload.answer
    ai_result = await ai_review(AiReviewRequest(mode="review", source=source))
    submission = {
        "id": str(uuid.uuid4()),
        "exercise_id": payload.exercise_id,
        "student_name": payload.student_name,
        "answer": payload.answer,
        "status": "ai_reviewed",
        "score": estimate_score(ai_result.feedback),
        "ai_feedback": ai_result.feedback,
        "provider": ai_result.provider,
        "created_at": now_iso(),
    }

    if db_pool:
        row = await db_pool.fetchrow(
            """
            insert into submissions (exercise_id, student_id, answer, status, score)
            values ($1::uuid, $2::uuid, $3, 'ai_reviewed', $4)
            returning id::text, exercise_id::text, answer, status, score, created_at
            """,
            payload.exercise_id,
            payload.student_id,
            payload.answer,
            submission["score"],
        )
        submission.update(serialize_record(row))

        await db_pool.execute(
            """
            insert into ai_reviews (submission_id, provider, model, feedback)
            values ($1::uuid, $2, $3, $4)
            """,
            submission["id"],
            ai_result.provider.split(":")[0],
            ai_result.provider,
            ai_result.feedback,
        )
    else:
        MEMORY_SUBMISSIONS.insert(0, submission)
    if payload.student_id:
        await record_learning_event(
            LearningEventRequest(
                user_id=payload.student_id,
                event_type="submission",
                target_id=payload.exercise_id,
                metadata={"score": submission["score"], "provider": submission["provider"]},
            )
        )
    return submission


@app.get("/api/teacher/summary")
async def teacher_summary():
    if not db_pool:
        return memory_teacher_summary()

    totals = await db_pool.fetchrow(
        """
        select
          (select count(*) from users where role = 'student') as students,
          (select count(*) from submissions) as submissions,
          (select coalesce(avg(score), 0) from submissions where score is not null) as average_score,
          (select count(*) from submissions where status = 'submitted') as pending_reviews
        """
    )
    recent = await db_pool.fetch(
        """
        select s.id::text, s.answer, s.status, s.score, s.created_at, e.title as exercise_title
        from submissions s
        left join exercises e on e.id = s.exercise_id
        order by s.created_at desc
        limit 5
        """
    )
    knowledge = await db_pool.fetch(
        """
        select kp.title, count(e.id) as exercise_count
        from knowledge_points kp
        left join exercises e on e.knowledge_point_id = kp.id
        group by kp.id, kp.title
        order by exercise_count desc, kp.title
        limit 5
        """
    )

    return {
        "students": int(totals["students"] or 0),
        "submissions": int(totals["submissions"] or 0),
        "average_score": round(float(totals["average_score"] or 0), 1),
        "pending_reviews": int(totals["pending_reviews"] or 0),
        "top_knowledge": [serialize_record(row) for row in knowledge],
        "recent_submissions": [serialize_record(row) for row in recent],
    }


@app.post("/api/ai/review", response_model=AiReviewResponse)
async def ai_review(payload: AiReviewRequest):
    provider = os.getenv("AI_PROVIDER", "mock").lower()

    if provider == "deepseek":
        return await deepseek_review(payload)
    if provider == "ollama":
        return await ollama_review(payload)

    return AiReviewResponse(
        provider="mock",
        feedback=mock_feedback(payload),
    )


async def deepseek_review(payload: AiReviewRequest) -> AiReviewResponse:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
    if not api_key:
        return AiReviewResponse(provider="mock", feedback=mock_feedback(payload))

    messages = build_messages(payload)
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            "https://api.deepseek.com/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": model, "messages": messages, "temperature": 0.3},
        )
        response.raise_for_status()
        data = response.json()

    return AiReviewResponse(
        provider=f"deepseek:{model}",
        feedback=data["choices"][0]["message"]["content"],
    )


async def ollama_review(payload: AiReviewRequest) -> AiReviewResponse:
    host = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
    model = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")
    messages = build_messages(payload)
    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            f"{host}/api/chat",
            json={"model": model, "messages": messages, "stream": False},
        )
        response.raise_for_status()
        data = response.json()

    return AiReviewResponse(
        provider=f"ollama:{model}",
        feedback=data["message"]["content"],
    )


def build_messages(payload: AiReviewRequest):
    task_map = {
        "review": "请点评学生的中日/日中翻译表达，指出体裁、语体、术语、逻辑和可修改方向。",
        "exercise": "请基于输入材料生成一组翻译练习，包含题目、难度、知识点和参考反馈。",
        "rubric": "请生成评分量表，包含准确性、语体、术语一致性、格式规范和表达自然度。",
    }
    return [
        {
            "role": "system",
            "content": "你是大学日语笔译课程的严谨助教，反馈要具体、可操作，避免空泛表扬。",
        },
        {
            "role": "user",
            "content": f"{task_map[payload.mode]}\n\n输入：\n{payload.source}",
        },
    ]


def mock_feedback(payload: AiReviewRequest) -> str:
    if payload.mode == "exercise":
        return "练习建议：围绕该材料生成 3 个任务：直译、商务体裁改写、错误诊断。每题绑定知识点并给出评分标准。"
    if payload.mode == "rubric":
        return "评分量表：准确性 40%，语体与体裁 25%，术语一致性 15%，格式规范 10%，表达自然度 10%。"
    return "译文点评：先判断文本功能，再按目标体裁重构表达。注意保留期限、责任主体和金额等业务事实，同时用日语自然的缓冲表达降低直接感。"


def serialize_record(record: asyncpg.Record | None) -> dict[str, Any]:
    if record is None:
        return {}
    data = dict(record)
    for key, value in data.items():
        if isinstance(value, datetime):
            data[key] = value.isoformat()
        elif value is not None and not isinstance(value, (str, int, float, bool, list, dict)):
            data[key] = str(value)
    return data


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def title_from_source(source: str) -> str:
    compact = " ".join(source.split())
    return f"AI 生成练习：{compact[:18] or '翻译任务'}"


def estimate_score(feedback: str) -> float:
    if "错误" in feedback or "注意" in feedback:
        return 82.0
    return 88.0


def memory_teacher_summary() -> dict[str, Any]:
    recent = MEMORY_SUBMISSIONS[:5]
    return {
        "students": 1 if recent else 0,
        "submissions": len(MEMORY_SUBMISSIONS),
        "average_score": round(
            sum(float(item["score"] or 0) for item in MEMORY_SUBMISSIONS) / max(len(MEMORY_SUBMISSIONS), 1),
            1,
        ),
        "pending_reviews": 0,
        "top_knowledge": [
            {"title": "商务信函格式与社交距离", "exercise_count": 3},
            {"title": "契约条件嵌套的集合论逻辑", "exercise_count": 2},
            {"title": "MTPE 质量评估与人工干预", "exercise_count": 1},
        ],
        "recent_submissions": recent,
    }


async def award_achievements(user_id: str) -> None:
    if not db_pool:
        events = [item for item in MEMORY_EVENTS if item["user_id"] == user_id]
        earned_codes = {item["achievement_code"] for item in MEMORY_USER_ACHIEVEMENTS if item["user_id"] == user_id}
        for code in qualified_achievement_codes(events):
            if code not in earned_codes:
                MEMORY_USER_ACHIEVEMENTS.append({"user_id": user_id, "achievement_code": code, "awarded_at": now_iso()})
        return

    stats = await db_pool.fetchrow(
        """
        select
          count(*) as events,
          count(*) filter (where event_type = 'login') as logins,
          count(*) filter (where event_type = 'ai_review') as ai_reviews,
          count(*) filter (where event_type = 'submission') as submissions,
          count(distinct target_id) filter (where event_type = 'knowledge_view') as knowledge_count
        from learning_events
        where user_id = $1::uuid
        """,
        user_id,
    )
    qualified = []
    if int(stats["logins"] or 0) >= 1:
        qualified.append("first-login")
    if int(stats["knowledge_count"] or 0) >= 3:
        qualified.append("graph-explorer")
    if int(stats["ai_reviews"] or 0) >= 1:
        qualified.append("ai-practice")
    if int(stats["submissions"] or 0) >= 1:
        qualified.append("first-submission")
    if int(stats["events"] or 0) >= 8:
        qualified.append("steady-learner")

    for code in qualified:
        await db_pool.execute(
            """
            insert into user_achievements (user_id, achievement_code)
            values ($1::uuid, $2)
            on conflict do nothing
            """,
            user_id,
            code,
        )


def qualified_achievement_codes(events: list[dict[str, Any]]) -> list[str]:
    event_types = [item["event_type"] for item in events]
    knowledge_targets = {item.get("target_id") for item in events if item["event_type"] == "knowledge_view" and item.get("target_id")}
    codes = []
    if "login" in event_types:
        codes.append("first-login")
    if len(knowledge_targets) >= 3:
        codes.append("graph-explorer")
    if "ai_review" in event_types:
        codes.append("ai-practice")
    if "submission" in event_types:
        codes.append("first-submission")
    if len(events) >= 8:
        codes.append("steady-learner")
    return codes


def memory_student_dashboard(events: list[dict[str, Any]], earned: list[dict[str, Any]]) -> dict[str, Any]:
    earned_codes = {item["achievement_code"] for item in earned}
    return {
        "stats": {
            "event_count": len(events),
            "knowledge_views": len([item for item in events if item["event_type"] == "knowledge_view"]),
            "knowledge_count": len({item.get("target_id") for item in events if item["event_type"] == "knowledge_view"}),
            "submissions": len([item for item in events if item["event_type"] == "submission"]),
            "ai_reviews": len([item for item in events if item["event_type"] == "ai_review"]),
        },
        "achievements": [{**item, "achievement_code": item["code"]} for item in ACHIEVEMENTS if item["code"] in earned_codes],
        "recent_events": events[-8:][::-1],
        "available_achievements": ACHIEVEMENTS,
    }


async def upsert_course_week(conn: asyncpg.Connection, item: CourseWeekPayload):
    return await conn.fetchrow(
        """
        insert into course_weeks (id, module, mode, title, summary, route, status)
        values ($1, $2, $3, $4, $5, $6, $7)
        on conflict (id) do update set
          module = excluded.module,
          mode = excluded.mode,
          title = excluded.title,
          summary = excluded.summary,
          route = excluded.route,
          status = excluded.status,
          updated_at = now()
        returning id, module, mode, title, summary, route, status
        """,
        item.id,
        item.module,
        item.mode,
        item.title,
        item.summary,
        item.route,
        item.status,
    )


async def upsert_knowledge_point(conn: asyncpg.Connection, item: KnowledgePointPayload):
    return await conn.fetchrow(
        """
        insert into knowledge_points (id, title, module, week, tags, mastery, description)
        values ($1, $2, $3, $4, $5, $6, $7)
        on conflict (id) do update set
          title = excluded.title,
          module = excluded.module,
          week = excluded.week,
          tags = excluded.tags,
          mastery = excluded.mastery,
          description = excluded.description
        returning id, title, module, week, tags, mastery, description
        """,
        item.id,
        item.title,
        item.module,
        item.week,
        item.tags,
        item.mastery,
        item.description,
    )


async def upsert_knowledge_edge(conn: asyncpg.Connection, item: KnowledgeEdgePayload):
    return await conn.fetchrow(
        """
        insert into knowledge_edges (source_id, target_id, label)
        values ($1, $2, $3)
        on conflict (source_id, target_id) do update set label = excluded.label
        returning source_id, target_id, label
        """,
        item.source_id,
        item.target_id,
        item.label,
    )


def replace_memory(items: list[dict[str, Any]], item: dict[str, Any], *keys: str) -> None:
    items[:] = [existing for existing in items if not all(existing.get(key) == item.get(key) for key in keys)]
    items.append(item)
