create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  role text not null check (role in ('student', 'teacher', 'admin', 'guest')),
  class_name text,
  created_at timestamptz not null default now()
);

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

create table if not exists knowledge_points (
  id text primary key,
  title text not null,
  module text not null,
  week int not null,
  tags text[] not null default '{}',
  mastery int not null default 0 check (mastery >= 0 and mastery <= 100),
  description text not null,
  created_at timestamptz not null default now()
);

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

create table if not exists lessons (
  id text primary key,
  week int not null,
  title text not null,
  subtitle text not null,
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  knowledge_point_id text references knowledge_points(id),
  title text not null,
  prompt text not null,
  difficulty text not null check (difficulty in ('初级', '中级', '高级')),
  exercise_type text not null,
  rubric jsonb not null default '{}'::jsonb,
  reference_answer text,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid references exercises(id),
  student_id uuid references users(id),
  answer text not null,
  status text not null default 'submitted' check (status in ('submitted', 'ai_reviewed', 'teacher_reviewed')),
  score numeric(5,2),
  created_at timestamptz not null default now()
);

create table if not exists ai_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id),
  provider text not null,
  model text not null,
  feedback text not null,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create table if not exists teacher_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id),
  teacher_id uuid references users(id),
  score numeric(5,2),
  feedback text not null,
  created_at timestamptz not null default now()
);

create table if not exists web_contents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text,
  summary text,
  difficulty text,
  category text,
  keywords text[] not null default '{}',
  content text,
  created_at timestamptz not null default now()
);

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

create index if not exists idx_knowledge_points_module on knowledge_points(module);
create index if not exists idx_learning_events_user on learning_events(user_id);
create index if not exists idx_learning_events_type on learning_events(event_type);
create index if not exists idx_course_weeks_status on course_weeks(status);
create index if not exists idx_knowledge_edges_source on knowledge_edges(source_id);
create index if not exists idx_knowledge_edges_target on knowledge_edges(target_id);
create index if not exists idx_exercises_knowledge_point on exercises(knowledge_point_id);
create index if not exists idx_submissions_student on submissions(student_id);
create index if not exists idx_submissions_exercise on submissions(exercise_id);
create index if not exists idx_course_materials_week on course_materials(week);
create index if not exists idx_course_materials_category on course_materials(category);
