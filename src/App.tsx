import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  ClipboardPen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  PlayCircle,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  createSubmission,
  deleteKnowledgeEdge,
  fetchContent,
  fetchStudentDashboard,
  fetchMaterials,
  fetchTeacherAnalytics,
  fetchTeacherSummary,
  importContent,
  loginUser,
  recordLearningEvent,
  requestAiFeedback,
  saveCourseWeek,
  saveKnowledgeEdge,
  saveKnowledgePoint,
  type AiMode,
  type CourseWeekPayload,
  type CourseMaterial,
  type KnowledgeEdgePayload,
  type KnowledgePointPayload,
  type StudentDashboard,
  type TeacherAnalytics,
  type TeacherSummary,
  type UserProfile,
} from './api'
import { featurePages, gameCases, knowledgePoints, lessons, weeks, type FeaturePage, type Lesson } from './courseData'

type View = 'home' | 'learn' | 'teacher' | 'ai' | 'game' | string

const moduleColors = ['#d8a650', '#9f4146', '#2d6574', '#6b705c', '#5b5b9a', '#9a6a4a']

const graphLayout: Record<string, { x: number; y: number; group: string }> = {
  equivalence: { x: 70, y: 210, group: '理论基础' },
  corpus: { x: 70, y: 340, group: '理论基础' },
  register: { x: 240, y: 160, group: '语体转换' },
  keigo: { x: 240, y: 290, group: '语体转换' },
  'speech-structure': { x: 240, y: 420, group: '语体转换' },
  'game-ui': { x: 430, y: 120, group: '本地化' },
  transcreation: { x: 430, y: 250, group: '本地化' },
  'cat-workflow': { x: 430, y: 380, group: '本地化' },
  'seo-copy': { x: 620, y: 110, group: '商业传播' },
  'brand-voice': { x: 620, y: 240, group: '商业传播' },
  'ecommerce-copy': { x: 620, y: 370, group: '商业传播' },
  'tourism-perspective': { x: 780, y: 190, group: '公共传播' },
  'news-5w1h': { x: 780, y: 330, group: '公共传播' },
  terminology: { x: 970, y: 120, group: '专业文体' },
  mtpe: { x: 970, y: 250, group: '专业文体' },
  'interval-boundary': { x: 970, y: 380, group: '专业文体' },
  'business-format': { x: 1160, y: 170, group: '高风险文本' },
  'legal-conditions': { x: 1160, y: 310, group: '高风险文本' },
  'deemed-presumed': { x: 1160, y: 440, group: '高风险文本' },
}

const graphGroups = ['理论基础', '语体转换', '本地化', '商业传播', '公共传播', '专业文体', '高风险文本']

const defaultKnowledgeEdges: KnowledgeEdgePayload[] = [
  { source_id: 'equivalence', target_id: 'register' },
  { source_id: 'equivalence', target_id: 'corpus' },
  { source_id: 'register', target_id: 'keigo' },
  { source_id: 'register', target_id: 'speech-structure' },
  { source_id: 'register', target_id: 'brand-voice' },
  { source_id: 'keigo', target_id: 'business-format' },
  { source_id: 'corpus', target_id: 'cat-workflow' },
  { source_id: 'game-ui', target_id: 'transcreation' },
  { source_id: 'game-ui', target_id: 'cat-workflow' },
  { source_id: 'transcreation', target_id: 'seo-copy' },
  { source_id: 'cat-workflow', target_id: 'mtpe' },
  { source_id: 'seo-copy', target_id: 'brand-voice' },
  { source_id: 'brand-voice', target_id: 'ecommerce-copy' },
  { source_id: 'brand-voice', target_id: 'tourism-perspective' },
  { source_id: 'tourism-perspective', target_id: 'news-5w1h' },
  { source_id: 'terminology', target_id: 'mtpe' },
  { source_id: 'mtpe', target_id: 'business-format' },
  { source_id: 'business-format', target_id: 'legal-conditions' },
  { source_id: 'legal-conditions', target_id: 'interval-boundary' },
  { source_id: 'legal-conditions', target_id: 'deemed-presumed' },
]

function App() {
  const [view, setView] = useState<View>('home')
  const [selectedKnowledge, setSelectedKnowledge] = useState(knowledgePoints[0].id)
  const [courseWeeks, setCourseWeeks] = useState<CourseWeekPayload[]>(weeks)
  const [courseKnowledge, setCourseKnowledge] = useState<KnowledgePointPayload[]>(knowledgePoints)
  const [courseEdges, setCourseEdges] = useState<KnowledgeEdgePayload[]>(defaultKnowledgeEdges)
  const [contentState, setContentState] = useState('使用本地课程数据')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('agathon-user')
    return saved ? JSON.parse(saved) as UserProfile : null
  })

  const activeLesson = useMemo(() => lessons.find((lesson) => lesson.slug === view), [view])
  const activeFeature = useMemo(() => featurePages.find((feature) => feature.slug === view), [view])
  const selectedPoint = courseKnowledge.find((item) => item.id === selectedKnowledge) ?? courseKnowledge[0] ?? knowledgePoints[0]

  async function refreshContent() {
    try {
      const content = await fetchContent()
      if (content.weeks.length) setCourseWeeks(content.weeks)
      if (content.knowledge_points.length) setCourseKnowledge(content.knowledge_points)
      if (content.knowledge_edges.length) setCourseEdges(content.knowledge_edges)
      setContentState(content.knowledge_points.length ? '已连接课程数据库' : '课程数据库为空，可一键同步本地课程')
    } catch {
      setContentState('后端未连接，使用本地课程数据')
    }
  }

  useEffect(() => {
    refreshContent()
  }, [])

  useEffect(() => {
    if (!courseKnowledge.some((point) => point.id === selectedKnowledge) && courseKnowledge[0]) {
      setSelectedKnowledge(courseKnowledge[0].id)
    }
  }, [courseKnowledge, selectedKnowledge])

  return (
    <main className="app-shell">
      <TopNav setView={setView} />
      <AnimatePresence mode="wait">
        {view === 'home' && <HomeView key="home" setView={setView} courseWeeks={courseWeeks} />}
        {view === 'learn' && (
          <StudentView
            key="learn"
            setView={setView}
            selectedKnowledge={selectedKnowledge}
            setSelectedKnowledge={setSelectedKnowledge}
            selectedPoint={selectedPoint}
            knowledge={courseKnowledge}
            edges={courseEdges}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        )}
        {view === 'teacher' && (
          <TeacherView
            key="teacher"
            setView={setView}
            courseWeeks={courseWeeks}
            knowledge={courseKnowledge}
            edges={courseEdges}
            contentState={contentState}
            refreshContent={refreshContent}
            setCourseWeeks={setCourseWeeks}
            setCourseKnowledge={setCourseKnowledge}
            setCourseEdges={setCourseEdges}
          />
        )}
        {view === 'ai' && <AiWorkbench key="ai" setView={setView} currentUser={currentUser} />}
        {view === 'materials' && <MaterialsView key="materials" setView={setView} currentUser={currentUser} />}
        {view === 'game' && <GameLocalizationView key="game" setView={setView} />}
        {activeLesson && <LessonView key={activeLesson.slug} lesson={activeLesson} setView={setView} />}
        {activeFeature && <FeaturePageView key={activeFeature.slug} feature={activeFeature} setView={setView} />}
      </AnimatePresence>
    </main>
  )
}

function TopNav({ setView }: { setView: (view: View) => void }) {
  return (
    <header className="top-nav">
      <button className="brand" onClick={() => setView('home')}>
        <span className="brand-mark">译</span>
        <span>
          <strong>LinguistCraft</strong>
          <small>日语笔译理论与实践</small>
        </span>
      </button>
      <nav>
        <button onClick={() => setView('learn')}>
          <GraduationCap size={18} />
          学生端
        </button>
        <button onClick={() => setView('teacher')}>
          <LayoutDashboard size={18} />
          教师端
        </button>
        <button onClick={() => setView('ai')}>
          <WandSparkles size={18} />
          AI 工作台
        </button>
        <button onClick={() => setView('materials')}>
          <FileText size={18} />
          讲义库
        </button>
      </nav>
    </header>
  )
}

function Screen({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
    >
      {children}
    </motion.section>
  )
}

function HomeView({ setView, courseWeeks }: { setView: (view: View) => void; courseWeeks: CourseWeekPayload[] }) {
  return (
    <Screen className="home-view">
      <section className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">LINGUISTCRAFT · 在线课程</p>
          <h1>日语笔译理论与实践</h1>
          <p className="hero-text">
            面向本科三年级课程的自有教学平台：课程讲义、知识图谱、AI 陪练、自动生成练习与教师学情管理统一在一个应用内。
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => setView('learn')}>
              <PlayCircle size={18} />
              进入学生练习中心
            </button>
            <button className="secondary-btn" onClick={() => setView('teacher')}>
              <BarChart3 size={18} />
              查看教师后台
            </button>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-top">
            <span>AI 迁移版 MVP</span>
            <Sparkles size={18} />
          </div>
          <div className="metric-grid">
            <Metric value="16" label="周课程" />
            <Metric value="43+" label="知识点" />
            <Metric value="4" label="AI 功能" />
            <Metric value="3" label="角色端" />
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Functional Modules</p>
            <h2>功能模块</h2>
          </div>
        </div>
        <div className="feature-grid">
          {featurePages.map((feature) => (
            <button className="feature-card" key={feature.slug} onClick={() => setView(feature.slug)}>
              <span>{feature.badge}</span>
              <strong>{feature.title}</strong>
              <p>{feature.subtitle}</p>
              <em>进入模块 <ChevronRight size={15} /></em>
            </button>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Course Map</p>
          <h2>课程大纲</h2>
        </div>
        <div className="week-grid">
          {courseWeeks.map((week) => (
            <button
              className={`week-card ${week.status === 'ready' ? 'ready' : ''}`}
              key={week.id}
              onClick={() => week.route && setView(week.route)}
            >
              <span className="week-number">{week.id}</span>
              <span className="week-module">{week.module}</span>
              <strong>{week.title}</strong>
              <small>{week.mode}</small>
              <p>{week.summary}</p>
              {week.status === 'ready' && <span className="open-link">已迁移 <ChevronRight size={15} /></span>}
            </button>
          ))}
        </div>
      </section>
    </Screen>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function StudentView({
  setView,
  selectedKnowledge,
  setSelectedKnowledge,
  selectedPoint,
  knowledge,
  edges,
  currentUser,
  setCurrentUser,
}: {
  setView: (view: View) => void
  selectedKnowledge: string
  setSelectedKnowledge: (id: string) => void
  selectedPoint: KnowledgePointPayload
  knowledge: KnowledgePointPayload[]
  edges: KnowledgeEdgePayload[]
  currentUser: UserProfile | null
  setCurrentUser: (user: UserProfile | null) => void
}) {
  const [loginForm, setLoginForm] = useState({ name: currentUser?.name ?? '', email: currentUser?.email ?? '', class_name: currentUser?.class_name ?? '' })
  const [studentDashboard, setStudentDashboard] = useState<StudentDashboard | null>(null)
  const [studentState, setStudentState] = useState(currentUser ? '学习档案已连接' : '请先建立学习档案')

  async function refreshStudentDashboard(user = currentUser) {
    if (!user) return
    try {
      const data = await fetchStudentDashboard(user.id)
      setStudentDashboard(data)
      setStudentState('学习记录已同步')
    } catch {
      setStudentState('学习记录暂未同步')
    }
  }

  async function handleStudentLogin() {
    setStudentState('登录中...')
    try {
      const user = await loginUser({ ...loginForm, role: 'student' })
      localStorage.setItem('agathon-user', JSON.stringify(user))
      setCurrentUser(user)
      await refreshStudentDashboard(user)
    } catch {
      setStudentState('登录失败，请检查后端连接')
    }
  }

  async function handleKnowledgeSelect(id: string) {
    setSelectedKnowledge(id)
    if (!currentUser) return
    try {
      await recordLearningEvent({ user_id: currentUser.id, event_type: 'knowledge_view', target_id: id })
      await refreshStudentDashboard(currentUser)
    } catch {
      setStudentState('本次学习记录未保存')
    }
  }

  useEffect(() => {
    refreshStudentDashboard()
  }, [currentUser?.id])

  return (
    <Screen className="workspace-view">
      <BackButton setView={setView} />
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Student Dashboard</p>
          <h1>学习中心</h1>
        </div>
        <button className="primary-btn" onClick={() => setView('ai')}>
          <Brain size={18} />
          打开 AI 陪练
        </button>
      </div>

      <div className="stat-strip">
        <Metric value="0m" label="累计学习" />
        <Metric value="0题" label="完成练习" />
        <Metric value="--" label="平均得分" />
        <Metric value="0/13" label="成就徽章" />
      </div>

      <div className="two-column">
        <section className="content-pane">
          <div className="section-heading compact">
            <p className="eyebrow">Knowledge Graph</p>
            <h2>知识点图谱</h2>
          </div>
          <KnowledgeGraph knowledge={knowledge} edges={edges} selectedKnowledge={selectedKnowledge} setSelectedKnowledge={handleKnowledgeSelect} />
          <article className="detail-panel">
            <span className="pill">{selectedPoint.module}</span>
            <h3>{selectedPoint.title}</h3>
            <p>{selectedPoint.description}</p>
            <div className="tag-row">
            {selectedPoint.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="mastery-bar">
              <span style={{ width: `${selectedPoint.mastery}%` }} />
            </div>
          </article>
        </section>

        <aside className="side-pane">
          <div className="section-heading compact">
            <p className="eyebrow">Learning Path</p>
            <h2>个性化学习路径</h2>
          </div>
          <div className="path-list">
            {knowledge.slice(0, 5).map((point, index) => (
              <button key={point.id} onClick={() => handleKnowledgeSelect(point.id)}>
                <span>{index + 1}</span>
                <strong>{point.title}</strong>
                <small>{point.module} · {point.tags[0]}</small>
              </button>
            ))}
          </div>
          <StudentProfilePanel
            currentUser={currentUser}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            handleStudentLogin={handleStudentLogin}
            dashboard={studentDashboard}
            state={studentState}
          />
        </aside>
      </div>
    </Screen>
  )
}

function StudentProfilePanel({
  currentUser,
  loginForm,
  setLoginForm,
  handleStudentLogin,
  dashboard,
  state,
}: {
  currentUser: UserProfile | null
  loginForm: { name: string; email: string; class_name: string }
  setLoginForm: React.Dispatch<React.SetStateAction<{ name: string; email: string; class_name: string }>>
  handleStudentLogin: () => void
  dashboard: StudentDashboard | null
  state: string
}) {
  return (
    <div className="student-profile">
      <div className="section-heading compact">
        <p className="eyebrow">Learning Record</p>
        <h2>学习档案</h2>
      </div>
      {currentUser ? (
        <div className="profile-card">
          <strong>{currentUser.name}</strong>
          <span>{currentUser.class_name || '未设置班级'} · {state}</span>
          <div className="mini-stats">
            <span><b>{dashboard?.stats.knowledge_count ?? 0}</b>知识点</span>
            <span><b>{dashboard?.stats.submissions ?? 0}</b>提交</span>
            <span><b>{dashboard?.achievements.length ?? 0}</b>徽章</span>
          </div>
          <div className="badge-grid">
            {(dashboard?.achievements.length ? dashboard.achievements : dashboard?.available_achievements.slice(0, 3) ?? []).map((badge) => {
              const isEarned = 'awarded_at' in badge && Boolean(badge.awarded_at)
              const badgeKey = 'achievement_code' in badge ? badge.achievement_code : badge.code
              return (
              <span className={isEarned ? 'earned' : ''} key={badgeKey}>
                <i>{badge.icon}</i>
                {badge.title}
              </span>
            )})}
          </div>
        </div>
      ) : (
        <div className="profile-card">
          <input value={loginForm.name} onChange={(event) => setLoginForm((item) => ({ ...item, name: event.target.value }))} placeholder="姓名" />
          <input value={loginForm.email} onChange={(event) => setLoginForm((item) => ({ ...item, email: event.target.value }))} placeholder="邮箱" />
          <input value={loginForm.class_name ?? ''} onChange={(event) => setLoginForm((item) => ({ ...item, class_name: event.target.value }))} placeholder="班级，例如 24日语1班" />
          <button className="primary-btn" onClick={handleStudentLogin}>建立学习档案</button>
          <small>{state}</small>
        </div>
      )}
    </div>
  )
}

function KnowledgeGraph({
  knowledge,
  edges,
  selectedKnowledge,
  setSelectedKnowledge,
}: {
  knowledge: KnowledgePointPayload[]
  edges: KnowledgeEdgePayload[]
  selectedKnowledge: string
  setSelectedKnowledge: (id: string) => void
}) {
  const positions = useMemo(() => buildGraphPositions(knowledge), [knowledge])
  const selected = knowledge.find((point) => point.id === selectedKnowledge)
  const selectedNeighbors = new Set(
    edges
      .filter((edge) => edge.source_id === selectedKnowledge || edge.target_id === selectedKnowledge)
      .flatMap((edge) => [edge.source_id, edge.target_id]),
  )

  return (
    <div className="knowledge-graph-shell">
      <div className="graph-stage">
        <svg className="knowledge-graph" viewBox="0 0 1240 520" role="img" aria-label="课程知识点关系图谱">
          <defs>
            <marker id="arrow-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          {graphGroups.map((group, index) => (
            <g className="graph-band" key={group}>
              <rect x={18 + index * 173} y="24" width="142" height="466" rx="10" />
              <text x={30 + index * 173} y="52">{group}</text>
            </g>
          ))}
          {edges.map((edge) => {
            const source = positions[edge.source_id]
            const target = positions[edge.target_id]
            if (!source || !target) return null
            const isActive = selectedNeighbors.has(edge.source_id) && selectedNeighbors.has(edge.target_id)
            return (
              <path
                className={`graph-edge ${isActive ? 'active' : ''}`}
                key={`${edge.source_id}-${edge.target_id}`}
                d={`M ${source.x + 46} ${source.y} C ${source.x + 90} ${source.y}, ${target.x - 90} ${target.y}, ${target.x - 46} ${target.y}`}
              />
            )
          })}
          {knowledge.map((point, index) => {
            const pos = positions[point.id]
            if (!pos) return null
            const isActive = point.id === selectedKnowledge
            const isNeighbor = selectedNeighbors.has(point.id)
            return (
              <g
                className={`graph-node ${isActive ? 'active' : ''} ${isNeighbor ? 'neighbor' : ''}`}
                key={point.id}
                onClick={() => setSelectedKnowledge(point.id)}
                onKeyDown={(event) => event.key === 'Enter' && setSelectedKnowledge(point.id)}
                role="button"
                tabIndex={0}
                style={{ ['--node-color' as string]: moduleColors[index % moduleColors.length] }}
              >
                <circle cx={pos.x} cy={pos.y} r="42" />
                <text className="node-week" x={pos.x} y={pos.y - 8}>W{point.week}</text>
                <text className="node-title" x={pos.x} y={pos.y + 14}>{point.title.slice(0, 6)}</text>
                <text className="node-score" x={pos.x} y={pos.y + 32}>{point.mastery}%</text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="graph-legend">
        <span><i className="legend-dot active-dot" />当前节点</span>
        <span><i className="legend-line" />前置/后续关系</span>
        <span>{selected ? `${selected.title}：${selected.tags.join(' / ')}` : '选择一个节点查看关系'}</span>
      </div>
    </div>
  )
}

function buildGraphPositions(points: KnowledgePointPayload[]) {
  const counters: Record<string, number> = {}
  return points.reduce<Record<string, { x: number; y: number; group: string }>>((positions, point) => {
    if (graphLayout[point.id]) {
      positions[point.id] = graphLayout[point.id]
      return positions
    }
    const group = groupForModule(point.module)
    const groupIndex = Math.max(graphGroups.indexOf(group), 0)
    const slot = counters[group] ?? 0
    counters[group] = slot + 1
    positions[point.id] = {
      x: 70 + groupIndex * 173,
      y: 118 + (slot % 4) * 105,
      group,
    }
    return positions
  }, {})
}

function groupForModule(module: string) {
  if (module.includes('导论')) return '理论基础'
  if (module.includes('社交') || module.includes('致辞')) return '语体转换'
  if (module.includes('网络') || module.includes('游戏')) return '本地化'
  if (module.includes('广告') || module.includes('营销')) return '商业传播'
  if (module.includes('旅游') || module.includes('新闻')) return '公共传播'
  if (module.includes('科技')) return '专业文体'
  return '高风险文本'
}

function TeacherView({
  setView,
  courseWeeks,
  knowledge,
  edges,
  contentState,
  refreshContent,
  setCourseWeeks,
  setCourseKnowledge,
  setCourseEdges,
}: {
  setView: (view: View) => void
  courseWeeks: CourseWeekPayload[]
  knowledge: KnowledgePointPayload[]
  edges: KnowledgeEdgePayload[]
  contentState: string
  refreshContent: () => Promise<void>
  setCourseWeeks: React.Dispatch<React.SetStateAction<CourseWeekPayload[]>>
  setCourseKnowledge: React.Dispatch<React.SetStateAction<KnowledgePointPayload[]>>
  setCourseEdges: React.Dispatch<React.SetStateAction<KnowledgeEdgePayload[]>>
}) {
  const [summary, setSummary] = useState<TeacherSummary>({
    students: 0,
    submissions: 0,
    average_score: 0,
    pending_reviews: 0,
    top_knowledge: [
      { title: '商务信函格式与社交距离', exercise_count: 3 },
      { title: '契约条件嵌套的集合论逻辑', exercise_count: 2 },
      { title: 'MTPE 质量评估与人工干预', exercise_count: 1 },
    ],
    recent_submissions: [],
  })
  const [syncState, setSyncState] = useState('等待连接后端')
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null)

  async function refreshSummary() {
    setSyncState('同步中...')
    try {
      const data = await fetchTeacherSummary()
      const analyticsData = await fetchTeacherAnalytics()
      setSummary(data)
      setAnalytics(analyticsData)
      setSyncState('已连接教学 API')
    } catch {
      setSyncState('后端未连接，显示本地迁移数据')
    }
  }

  useEffect(() => {
    refreshSummary()
  }, [])

  return (
    <Screen className="workspace-view">
      <BackButton setView={setView} />
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Teacher Console</p>
          <h1>教师后台</h1>
        </div>
        <button className="secondary-btn" onClick={() => setView('ai')}>
          <Sparkles size={18} />
          生成练习
        </button>
        <button className="secondary-btn" onClick={refreshSummary}>
          <LineChart size={18} />
          刷新数据
        </button>
        <button className="secondary-btn" onClick={() => setView('teacher-system')}>
          <NetworkIcon />
          迁移蓝图
        </button>
      </div>
      <div className="teacher-grid">
        <TeacherCard icon={<ClipboardPen />} title="作业提交" value={`${summary.submissions} 份`} text={`待复评 ${summary.pending_reviews} 份，学生端提交后可自动进入 AI 初评。`} />
        <TeacherCard icon={<LineChart />} title="学情分析" value={`${analytics?.events ?? 0} 次`} text={`${syncState} · ${analytics?.achievements ?? 0} 枚徽章已发放`} />
        <TeacherCard icon={<FileText />} title="课程内容" value={`${courseWeeks.length} 周`} text={contentState} />
        <TeacherCard icon={<WandSparkles />} title="AI 批改" value="DeepSeek/Ollama" text="统一 AI Provider，支持国产模型和本地模型切换。" />
      </div>
      <div className="two-column teacher-detail">
        <section className="content-pane">
          <div className="section-heading compact">
            <p className="eyebrow">Recent Submissions</p>
            <h2>近期提交</h2>
          </div>
          <div className="path-list">
            {(summary.recent_submissions.length ? summary.recent_submissions : [{ id: 'empty', answer: '暂无学生提交。打开 AI 工作台提交练习后，这里会显示记录。', status: 'empty', score: null }]).map((item) => (
              <button key={item.id}>
                <span>{item.score ?? '--'}</span>
                <strong>{item.exercise_title || item.student_name || '访客提交'}</strong>
                <small>{item.status || 'submitted'} · {item.answer?.slice(0, 38)}</small>
              </button>
            ))}
          </div>
        </section>
        <aside className="side-pane">
          <div className="section-heading compact">
            <p className="eyebrow">Student Analytics</p>
            <h2>学生学习统计</h2>
          </div>
          <div className="path-list">
            {(analytics?.students_detail.length ? analytics.students_detail : []).map((item) => (
              <button key={item.id}>
                <span>{item.badge_count}</span>
                <strong>{item.name}</strong>
                <small>{item.class_name || '未设置班级'} · {item.event_count} 次记录 · {item.knowledge_count} 个知识点</small>
              </button>
            ))}
            {!analytics?.students_detail.length && summary.top_knowledge.map((item, index) => (
              <button key={`${item.title}-${index}`}>
                <span>{item.exercise_count}</span>
                <strong>{item.title}</strong>
                <small>暂无学生登录，先显示练习覆盖</small>
              </button>
            ))}
          </div>
        </aside>
      </div>
      <ContentAdmin
        courseWeeks={courseWeeks}
        knowledge={knowledge}
        edges={edges}
        refreshContent={refreshContent}
        setCourseWeeks={setCourseWeeks}
        setCourseKnowledge={setCourseKnowledge}
        setCourseEdges={setCourseEdges}
      />
    </Screen>
  )
}

function ContentAdmin({
  courseWeeks,
  knowledge,
  edges,
  refreshContent,
  setCourseWeeks,
  setCourseKnowledge,
  setCourseEdges,
}: {
  courseWeeks: CourseWeekPayload[]
  knowledge: KnowledgePointPayload[]
  edges: KnowledgeEdgePayload[]
  refreshContent: () => Promise<void>
  setCourseWeeks: React.Dispatch<React.SetStateAction<CourseWeekPayload[]>>
  setCourseKnowledge: React.Dispatch<React.SetStateAction<KnowledgePointPayload[]>>
  setCourseEdges: React.Dispatch<React.SetStateAction<KnowledgeEdgePayload[]>>
}) {
  const [weekForm, setWeekForm] = useState<CourseWeekPayload>(courseWeeks[0] ?? weeks[0])
  const [pointForm, setPointForm] = useState<KnowledgePointPayload>(knowledge[0] ?? knowledgePoints[0])
  const [edgeForm, setEdgeForm] = useState<KnowledgeEdgePayload>(edges[0] ?? defaultKnowledgeEdges[0])
  const [state, setState] = useState('等待编辑')

  useEffect(() => {
    if (courseWeeks[0]) setWeekForm(courseWeeks[0])
  }, [courseWeeks])

  useEffect(() => {
    if (knowledge[0]) setPointForm(knowledge[0])
  }, [knowledge])

  async function handleImportContent() {
    setState('同步中...')
    try {
      const result = await importContent({
        weeks,
        knowledge_points: knowledgePoints,
        knowledge_edges: defaultKnowledgeEdges,
      })
      await refreshContent()
      setState(`已同步 ${result.weeks} 周、${result.knowledge_points} 个知识点、${result.knowledge_edges} 条关系`)
    } catch {
      setState('同步失败，请检查后端连接')
    }
  }

  async function handleSaveWeek() {
    setState('保存周次中...')
    try {
      const saved = await saveCourseWeek(weekForm)
      setCourseWeeks((items) => upsertList(items, saved, 'id').sort((a, b) => a.id - b.id))
      setState(`已保存第 ${saved.id} 周`)
    } catch {
      setState('保存周次失败')
    }
  }

  async function handleSavePoint() {
    setState('保存知识点中...')
    try {
      const saved = await saveKnowledgePoint(normalizePoint(pointForm))
      setCourseKnowledge((items) => upsertList(items, saved, 'id').sort((a, b) => a.week - b.week))
      setState(`已保存：${saved.title}`)
    } catch {
      setState('保存知识点失败')
    }
  }

  async function handleSaveEdge() {
    setState('保存图谱关系中...')
    try {
      const saved = await saveKnowledgeEdge(edgeForm)
      setCourseEdges((items) => upsertEdge(items, saved))
      setState(`已连接：${saved.source_id} -> ${saved.target_id}`)
    } catch {
      setState('保存关系失败，请确认两个知识点都存在')
    }
  }

  async function handleDeleteEdge(edge: KnowledgeEdgePayload) {
    setState('删除图谱关系中...')
    try {
      await deleteKnowledgeEdge(edge.source_id, edge.target_id)
      setCourseEdges((items) => items.filter((item) => item.source_id !== edge.source_id || item.target_id !== edge.target_id))
      setState(`已删除：${edge.source_id} -> ${edge.target_id}`)
    } catch {
      setState('删除关系失败')
    }
  }

  return (
    <section className="section-block admin-console">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Content Studio</p>
          <h2>课程内容后台</h2>
        </div>
        <div className="admin-actions">
          <span>{state}</span>
          <button className="secondary-btn" onClick={refreshContent}>刷新内容</button>
          <button className="primary-btn" onClick={handleImportContent}>同步本地课程到数据库</button>
        </div>
      </div>

      <div className="admin-grid">
        <article className="admin-panel">
          <h3>课程周次</h3>
          <select value={weekForm.id} onChange={(event) => setWeekForm(courseWeeks.find((item) => item.id === Number(event.target.value)) ?? weekForm)}>
            {courseWeeks.map((week) => <option value={week.id} key={week.id}>第 {week.id} 周 · {week.title}</option>)}
          </select>
          <div className="form-grid">
            <input value={weekForm.id} onChange={(event) => setWeekForm({ ...weekForm, id: Number(event.target.value) })} type="number" />
            <input value={weekForm.module} onChange={(event) => setWeekForm({ ...weekForm, module: event.target.value })} placeholder="模块" />
            <input value={weekForm.mode} onChange={(event) => setWeekForm({ ...weekForm, mode: event.target.value })} placeholder="教学模式" />
            <select value={weekForm.status} onChange={(event) => setWeekForm({ ...weekForm, status: event.target.value as 'ready' | 'planned' })}>
              <option value="ready">ready</option>
              <option value="planned">planned</option>
            </select>
          </div>
          <input value={weekForm.title} onChange={(event) => setWeekForm({ ...weekForm, title: event.target.value })} placeholder="标题" />
          <textarea value={weekForm.summary} onChange={(event) => setWeekForm({ ...weekForm, summary: event.target.value })} />
          <button className="primary-btn" onClick={handleSaveWeek}>保存周次</button>
        </article>

        <article className="admin-panel">
          <h3>知识点</h3>
          <select value={pointForm.id} onChange={(event) => setPointForm(knowledge.find((item) => item.id === event.target.value) ?? pointForm)}>
            {knowledge.map((point) => <option value={point.id} key={point.id}>{point.week} · {point.title}</option>)}
          </select>
          <div className="form-grid">
            <input value={pointForm.id} onChange={(event) => setPointForm({ ...pointForm, id: event.target.value })} placeholder="ID" />
            <input value={pointForm.week} onChange={(event) => setPointForm({ ...pointForm, week: Number(event.target.value) })} type="number" />
            <input value={pointForm.module} onChange={(event) => setPointForm({ ...pointForm, module: event.target.value })} placeholder="模块" />
            <input value={pointForm.mastery} onChange={(event) => setPointForm({ ...pointForm, mastery: Number(event.target.value) })} type="number" min="0" max="100" />
          </div>
          <input value={pointForm.title} onChange={(event) => setPointForm({ ...pointForm, title: event.target.value })} placeholder="知识点标题" />
          <input value={pointForm.tags.join('，')} onChange={(event) => setPointForm({ ...pointForm, tags: splitTags(event.target.value) })} placeholder="标签，用逗号分隔" />
          <textarea value={pointForm.description} onChange={(event) => setPointForm({ ...pointForm, description: event.target.value })} />
          <button className="primary-btn" onClick={handleSavePoint}>保存知识点</button>
        </article>

        <article className="admin-panel">
          <h3>图谱关系</h3>
          <div className="form-grid">
            <select value={edgeForm.source_id} onChange={(event) => setEdgeForm({ ...edgeForm, source_id: event.target.value })}>
              {knowledge.map((point) => <option value={point.id} key={point.id}>{point.title}</option>)}
            </select>
            <select value={edgeForm.target_id} onChange={(event) => setEdgeForm({ ...edgeForm, target_id: event.target.value })}>
              {knowledge.map((point) => <option value={point.id} key={point.id}>{point.title}</option>)}
            </select>
          </div>
          <input value={edgeForm.label ?? ''} onChange={(event) => setEdgeForm({ ...edgeForm, label: event.target.value })} placeholder="关系说明，可选" />
          <button className="primary-btn" onClick={handleSaveEdge}>添加/更新关系</button>
          <div className="edge-list">
            {edges.slice(0, 12).map((edge) => (
              <button key={`${edge.source_id}-${edge.target_id}`} onClick={() => handleDeleteEdge(edge)}>
                <span>{edge.source_id}</span>
                <strong>→</strong>
                <span>{edge.target_id}</span>
              </button>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

function splitTags(value: string) {
  return value.split(/[,，、]/).map((item) => item.trim()).filter(Boolean)
}

function normalizePoint(point: KnowledgePointPayload) {
  return { ...point, mastery: Math.max(0, Math.min(100, Number(point.mastery) || 0)), week: Number(point.week) || 1 }
}

function upsertList<T extends Record<string, unknown>>(items: T[], item: T, key: keyof T) {
  return [...items.filter((existing) => existing[key] !== item[key]), item]
}

function upsertEdge(items: KnowledgeEdgePayload[], item: KnowledgeEdgePayload) {
  return [...items.filter((edge) => edge.source_id !== item.source_id || edge.target_id !== item.target_id), item]
}

function NetworkIcon() {
  return <span className="mini-icon">DB</span>
}

function TeacherCard({ icon, title, value, text }: { icon: React.ReactNode; title: string; value: string; text: string }) {
  return (
    <article className="teacher-card">
      <div className="icon-box">{icon}</div>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{text}</p>
    </article>
  )
}

function AiWorkbench({ setView, currentUser }: { setView: (view: View) => void; currentUser: UserProfile | null }) {
  const [source, setSource] = useState('请贵司于本月30日前支付尾款。')
  const [mode, setMode] = useState<AiMode>('review')
  const [feedback, setFeedback] = useState('这句话应转为日语商务邮件中的礼貌请求，可加入缓冲语并保留付款期限这一业务事实。')
  const [provider, setProvider] = useState('mock')
  const [isLoading, setIsLoading] = useState(false)
  const [submissionState, setSubmissionState] = useState('尚未提交')

  async function handleAiFeedback() {
    setIsLoading(true)
    try {
      const result = await requestAiFeedback({ mode, source })
      setFeedback(result.feedback)
      setProvider(result.provider)
      if (currentUser) {
        await recordLearningEvent({ user_id: currentUser.id, event_type: 'ai_review', target_id: mode, metadata: { provider: result.provider } })
      }
    } catch {
      setProvider('local fallback')
      setFeedback('后端暂未连接或模型服务不可用。当前使用本地示例反馈：请先判断文本功能，再按日语商务邮件体裁补足缓冲表达，同时保留付款期限和责任关系。')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmitPractice() {
    setIsLoading(true)
    setSubmissionState('提交中...')
    try {
      const result = await createSubmission({
        student_id: currentUser?.id,
        student_name: currentUser?.name ?? '访客学生',
        answer: source,
        source,
      })
      setFeedback(result.ai_feedback)
      setProvider(result.provider)
      setSubmissionState(`已提交 · AI 初评 ${result.score ?? '--'} 分`)
    } catch {
      setSubmissionState('后端未连接，暂存失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Screen className="workspace-view">
      <BackButton setView={setView} />
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">AI Workbench</p>
          <h1>AI 陪练与自动练习</h1>
        </div>
      </div>
      <div className="ai-layout">
        <section className="content-pane">
          <div className="segmented">
            {([
              ['review', '译文点评'],
              ['exercise', '生成练习'],
              ['rubric', '评分量表'],
            ] as Array<[AiMode, string]>).map(([id, label]) => (
              <button className={mode === id ? 'active' : ''} key={id} onClick={() => setMode(id)}>
                {label}
              </button>
            ))}
          </div>
          <textarea value={source} onChange={(event) => setSource(event.target.value)} />
          <button className="primary-btn" onClick={handleAiFeedback} disabled={isLoading}>
            <WandSparkles size={18} />
            {isLoading ? '生成中...' : '生成 AI 反馈'}
          </button>
          <button className="secondary-btn" onClick={handleSubmitPractice} disabled={isLoading}>
            <ClipboardPen size={18} />
            提交为练习作业
          </button>
        </section>
        <aside className="side-pane ai-result">
          <p className="eyebrow">Provider Plan</p>
          <h2>模型接入方式</h2>
          <ul>
            <li><CheckCircle2 size={16} /> DeepSeek API：高质量点评与评分</li>
            <li><CheckCircle2 size={16} /> Ollama：本地隐私任务和低成本练习</li>
            <li><CheckCircle2 size={16} /> 通义/智谱：备用供应商</li>
          </ul>
          <div className="mock-output">
            <strong>反馈结果 · {provider}</strong>
            <p>{feedback}</p>
          </div>
          <div className="mock-output subtle-output">
            <strong>提交状态</strong>
            <p>{submissionState}</p>
          </div>
        </aside>
      </div>
    </Screen>
  )
}

function MaterialsView({ setView, currentUser }: { setView: (view: View) => void; currentUser: UserProfile | null }) {
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [filter, setFilter] = useState('全部')
  const [state, setState] = useState('加载讲义中...')

  const categories = useMemo(() => ['全部', ...Array.from(new Set(materials.map((item) => item.category)))], [materials])
  const visibleMaterials = useMemo(() => {
    return materials.filter((item) => filter === '全部' || item.category === filter)
  }, [materials, filter])
  const active = materials.find((item) => item.id === activeId) ?? visibleMaterials[0]

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMaterials()
        setMaterials(data)
        setActiveId(data[0]?.id ?? '')
        setState(data.length ? `已载入 ${data.length} 份讲义` : '讲义库为空，等待教师导入')
      } catch {
        setState('讲义库暂未连接')
      }
    }
    load()
  }, [])

  async function selectMaterial(item: CourseMaterial) {
    setActiveId(item.id)
    if (!currentUser) return
    try {
      await recordLearningEvent({ user_id: currentUser.id, event_type: 'lesson_view', target_id: item.id, metadata: { title: item.title, week: item.week } })
    } catch {
      setState('讲义查看记录未保存')
    }
  }

  return (
    <Screen className="workspace-view">
      <BackButton setView={setView} />
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Course Materials</p>
          <h1>讲义资料库</h1>
        </div>
        <span className="status-pill">{state}</span>
      </div>

      <div className="materials-layout">
        <aside className="materials-sidebar">
          <div className="segmented">
            {categories.map((category) => (
              <button className={filter === category ? 'active' : ''} key={category} onClick={() => setFilter(category)}>
                {category}
              </button>
            ))}
          </div>
          <div className="material-list">
            {visibleMaterials.map((item) => (
              <button className={active?.id === item.id ? 'active' : ''} key={item.id} onClick={() => selectMaterial(item)}>
                <span>W{item.week ?? '--'} · {item.material_type.toUpperCase()}</span>
                <strong>{item.title}</strong>
                <small>{item.summary || item.source_path}</small>
              </button>
            ))}
          </div>
        </aside>

        <article className="material-reader">
          {active ? (
            <>
              <span className="pill">{active.category} · 第 {active.week ?? '--'} 周</span>
              <h2>{active.title}</h2>
              <p className="material-source">{active.source_path}</p>
              <div className="callout">{active.summary}</div>
              <pre>{active.content}</pre>
            </>
          ) : (
            <div className="empty-state">暂无讲义材料。</div>
          )}
        </article>
      </div>
    </Screen>
  )
}

function LessonView({ lesson, setView }: { lesson: Lesson; setView: (view: View) => void }) {
  const [tab, setTab] = useState(lesson.tabs[0].id)
  const active = lesson.tabs.find((item) => item.id === tab) ?? lesson.tabs[0]

  return (
    <Screen className="lesson-view">
      <BackButton setView={setView} />
      <section className="lesson-hero">
        <p className="eyebrow">第 {lesson.week} 周</p>
        <h1>{lesson.title}</h1>
        <p>{lesson.subtitle}</p>
      </section>
      <div className="lesson-tabs">
        {lesson.tabs.map((item) => (
          <button className={item.id === tab ? 'active' : ''} key={item.id} onClick={() => setTab(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <article className="lesson-card">
        <h2>{active.heading}</h2>
        {active.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {active.callout && <div className="callout">{active.callout}</div>}
      </article>
    </Screen>
  )
}

function GameLocalizationView({ setView }: { setView: (view: View) => void }) {
  const [index, setIndex] = useState(0)
  const active = gameCases[index]

  return (
    <Screen className="lesson-view">
      <BackButton setView={setView} />
      <section className="lesson-hero">
        <p className="eyebrow">Game Localization</p>
        <h1>游戏本地化：中译日类型展示</h1>
        <p>比较不同风格的日文译文，观察语气、长度和本地化取向的变化。</p>
      </section>
      <div className="lesson-tabs">
        {gameCases.map((item, itemIndex) => (
          <button className={itemIndex === index ? 'active' : ''} key={item.category} onClick={() => setIndex(itemIndex)}>
            {item.category}
          </button>
        ))}
      </div>
      <article className="lesson-card split-card">
        <div>
          <span className="pill">中文原文</span>
          <h2>{active.category}</h2>
          <p>{active.source}</p>
        </div>
        <div className="version-list">
          {active.versions.map((version, versionIndex) => (
            <section key={version}>
              <span>版本 {String.fromCharCode(65 + versionIndex)}</span>
              <p>{version}</p>
            </section>
          ))}
        </div>
      </article>
    </Screen>
  )
}

function FeaturePageView({ feature, setView }: { feature: FeaturePage; setView: (view: View) => void }) {
  const [section, setSection] = useState(feature.sections[0].title)
  const active = feature.sections.find((item) => item.title === section) ?? feature.sections[0]

  return (
    <Screen className="lesson-view">
      <BackButton setView={setView} />
      <section className="lesson-hero">
        <p className="eyebrow">{feature.badge}</p>
        <h1>{feature.title}</h1>
        <p>{feature.subtitle}</p>
      </section>
      <div className="lesson-tabs">
        {feature.sections.map((item) => (
          <button className={item.title === section ? 'active' : ''} key={item.title} onClick={() => setSection(item.title)}>
            {item.title}
          </button>
        ))}
      </div>
      <article className="lesson-card feature-detail">
        <div>
          <h2>{active.title}</h2>
          {active.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {active.items && (
          <div className="feature-list">
            {active.items.map((item, index) => (
              <span key={item}>
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                {item}
              </span>
            ))}
          </div>
        )}
      </article>
    </Screen>
  )
}

function BackButton({ setView }: { setView: (view: View) => void }) {
  return (
    <button className="back-btn" onClick={() => setView('home')}>
      <ArrowLeft size={17} />
      返回首页
    </button>
  )
}

export default App
