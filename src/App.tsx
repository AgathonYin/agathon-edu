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
import { createSubmission, fetchTeacherSummary, requestAiFeedback, type AiMode, type TeacherSummary } from './api'
import { featurePages, gameCases, knowledgePoints, lessons, weeks, type FeaturePage, type Lesson } from './courseData'

type View = 'home' | 'learn' | 'teacher' | 'ai' | 'game' | string

const moduleColors = ['#d8a650', '#9f4146', '#2d6574', '#6b705c', '#5b5b9a', '#9a6a4a']

function App() {
  const [view, setView] = useState<View>('home')
  const [selectedKnowledge, setSelectedKnowledge] = useState(knowledgePoints[0].id)

  const activeLesson = useMemo(() => lessons.find((lesson) => lesson.slug === view), [view])
  const activeFeature = useMemo(() => featurePages.find((feature) => feature.slug === view), [view])
  const selectedPoint = knowledgePoints.find((item) => item.id === selectedKnowledge) ?? knowledgePoints[0]

  return (
    <main className="app-shell">
      <TopNav setView={setView} />
      <AnimatePresence mode="wait">
        {view === 'home' && <HomeView key="home" setView={setView} />}
        {view === 'learn' && (
          <StudentView
            key="learn"
            setView={setView}
            selectedKnowledge={selectedKnowledge}
            setSelectedKnowledge={setSelectedKnowledge}
            selectedPoint={selectedPoint}
          />
        )}
        {view === 'teacher' && <TeacherView key="teacher" setView={setView} />}
        {view === 'ai' && <AiWorkbench key="ai" setView={setView} />}
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

function HomeView({ setView }: { setView: (view: View) => void }) {
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
          {weeks.map((week) => (
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
}: {
  setView: (view: View) => void
  selectedKnowledge: string
  setSelectedKnowledge: (id: string) => void
  selectedPoint: (typeof knowledgePoints)[number]
}) {
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
          <div className="knowledge-map">
            {knowledgePoints.map((point, index) => (
              <button
                key={point.id}
                className={`knowledge-node ${selectedKnowledge === point.id ? 'active' : ''}`}
                style={{ ['--node-color' as string]: moduleColors[index % moduleColors.length] }}
                onClick={() => setSelectedKnowledge(point.id)}
              >
                <span>{point.module.slice(0, 1)}</span>
                <strong>W{point.week}</strong>
                <small>{point.mastery}%</small>
              </button>
            ))}
          </div>
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
            {knowledgePoints.slice(0, 5).map((point, index) => (
              <button key={point.id} onClick={() => setSelectedKnowledge(point.id)}>
                <span>{index + 1}</span>
                <strong>{point.title}</strong>
                <small>{point.module} · {point.tags[0]}</small>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </Screen>
  )
}

function TeacherView({ setView }: { setView: (view: View) => void }) {
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

  async function refreshSummary() {
    setSyncState('同步中...')
    try {
      const data = await fetchTeacherSummary()
      setSummary(data)
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
        <TeacherCard icon={<LineChart />} title="学情分析" value={`${summary.average_score || '--'} 分`} text={syncState} />
        <TeacherCard icon={<FileText />} title="课程内容" value="16 周" text="课程页、知识点、练习库已拆为可维护数据结构。" />
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
            <p className="eyebrow">Knowledge Coverage</p>
            <h2>练习覆盖</h2>
          </div>
          <div className="path-list">
            {summary.top_knowledge.map((item, index) => (
              <button key={`${item.title}-${index}`}>
                <span>{item.exercise_count}</span>
                <strong>{item.title}</strong>
                <small>已关联练习数</small>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </Screen>
  )
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

function AiWorkbench({ setView }: { setView: (view: View) => void }) {
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
        student_name: '访客学生',
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
