export type AiMode = 'review' | 'exercise' | 'rubric'

export type AiRequest = {
  mode: AiMode
  source: string
}

export type AiResponse = {
  provider: string
  feedback: string
}

export type Exercise = {
  id: string
  knowledge_point_id?: string | null
  title: string
  prompt: string
  difficulty: string
  exercise_type: string
  reference_answer?: string | null
  created_at: string
}

export type SubmissionResponse = {
  id: string
  exercise_id?: string | null
  student_name: string
  answer: string
  status: string
  score?: number | null
  ai_feedback: string
  provider: string
  created_at: string
}

export type UserProfile = {
  id: string
  email: string
  name: string
  role: string
  class_name?: string | null
}

export type StudentDashboard = {
  stats: {
    event_count: number
    knowledge_views: number
    knowledge_count: number
    submissions: number
    ai_reviews: number
  }
  achievements: Array<{
    code?: string
    achievement_code?: string
    title: string
    description: string
    icon: string
    awarded_at?: string
  }>
  recent_events: Array<{ event_type: string; target_id?: string | null; created_at?: string }>
  available_achievements: Array<{ code: string; title: string; description: string; icon: string; rule: string }>
}

export type TeacherAnalytics = {
  students: number
  events: number
  achievements: number
  submissions: number
  students_detail: Array<{
    id: string
    name: string
    email: string
    class_name?: string | null
    event_count: number
    knowledge_count: number
    badge_count: number
    last_active?: string | null
  }>
}

export type TeacherSummary = {
  students: number
  submissions: number
  average_score: number
  pending_reviews: number
  top_knowledge: Array<{ title: string; exercise_count: number }>
  recent_submissions: Array<{
    id: string
    answer?: string
    status?: string
    score?: number | null
    created_at?: string
    exercise_title?: string
    student_name?: string
    ai_feedback?: string
  }>
}

export type CourseWeekPayload = {
  id: number
  module: string
  mode: string
  title: string
  summary: string
  route?: string
  status: 'ready' | 'planned'
}

export type KnowledgePointPayload = {
  id: string
  title: string
  module: string
  week: number
  tags: string[]
  mastery: number
  description: string
}

export type KnowledgeEdgePayload = {
  source_id: string
  target_id: string
  label?: string | null
}

export type CourseContent = {
  weeks: CourseWeekPayload[]
  knowledge_points: KnowledgePointPayload[]
  knowledge_edges: KnowledgeEdgePayload[]
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || ''

export async function requestAiFeedback(payload: AiRequest): Promise<AiResponse> {
  const response = await fetch(`${baseUrl}/api/ai/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`)
  }

  return response.json()
}

export async function fetchTeacherSummary(): Promise<TeacherSummary> {
  const response = await fetch(`${baseUrl}/api/teacher/summary`)
  if (!response.ok) {
    throw new Error(`Teacher summary failed: ${response.status}`)
  }
  return response.json()
}

export async function fetchExercises(): Promise<Exercise[]> {
  const response = await fetch(`${baseUrl}/api/exercises`)
  if (!response.ok) {
    throw new Error(`Exercises failed: ${response.status}`)
  }
  return response.json()
}

export async function generateExercise(payload: {
  source: string
  knowledge_point_id?: string
  difficulty?: string
  exercise_type?: string
}): Promise<Exercise> {
  const response = await fetch(`${baseUrl}/api/exercises/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Generate exercise failed: ${response.status}`)
  }
  return response.json()
}

export async function createSubmission(payload: {
  exercise_id?: string
  student_id?: string
  student_name?: string
  answer: string
  source?: string
}): Promise<SubmissionResponse> {
  const response = await fetch(`${baseUrl}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Submission failed: ${response.status}`)
  }
  return response.json()
}

export async function loginUser(payload: { email: string; name: string; class_name?: string; role?: 'student' | 'teacher' }): Promise<UserProfile> {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'student', ...payload }),
  })
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`)
  }
  return response.json()
}

export async function recordLearningEvent(payload: {
  user_id: string
  event_type: 'login' | 'knowledge_view' | 'lesson_view' | 'ai_review' | 'submission'
  target_id?: string
  metadata?: Record<string, unknown>
}): Promise<{ ok: boolean }> {
  const response = await fetch(`${baseUrl}/api/learning-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metadata: {}, ...payload }),
  })
  if (!response.ok) {
    throw new Error(`Learning event failed: ${response.status}`)
  }
  return response.json()
}

export async function fetchStudentDashboard(userId: string): Promise<StudentDashboard> {
  const response = await fetch(`${baseUrl}/api/students/${userId}/dashboard`)
  if (!response.ok) {
    throw new Error(`Student dashboard failed: ${response.status}`)
  }
  return response.json()
}

export async function fetchTeacherAnalytics(): Promise<TeacherAnalytics> {
  const response = await fetch(`${baseUrl}/api/teacher/analytics`)
  if (!response.ok) {
    throw new Error(`Teacher analytics failed: ${response.status}`)
  }
  return response.json()
}

export async function fetchContent(): Promise<CourseContent> {
  const response = await fetch(`${baseUrl}/api/content`)
  if (!response.ok) {
    throw new Error(`Content failed: ${response.status}`)
  }
  return response.json()
}

export async function importContent(payload: CourseContent): Promise<{ ok: boolean; weeks: number; knowledge_points: number; knowledge_edges: number }> {
  const response = await fetch(`${baseUrl}/api/content/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Import content failed: ${response.status}`)
  }
  return response.json()
}

export async function saveCourseWeek(payload: CourseWeekPayload): Promise<CourseWeekPayload> {
  const response = await fetch(`${baseUrl}/api/course-weeks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Save course week failed: ${response.status}`)
  }
  return response.json()
}

export async function saveKnowledgePoint(payload: KnowledgePointPayload): Promise<KnowledgePointPayload> {
  const response = await fetch(`${baseUrl}/api/knowledge-points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Save knowledge point failed: ${response.status}`)
  }
  return response.json()
}

export async function saveKnowledgeEdge(payload: KnowledgeEdgePayload): Promise<KnowledgeEdgePayload> {
  const response = await fetch(`${baseUrl}/api/knowledge-edges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Save knowledge edge failed: ${response.status}`)
  }
  return response.json()
}

export async function deleteKnowledgeEdge(sourceId: string, targetId: string): Promise<{ ok: boolean }> {
  const response = await fetch(`${baseUrl}/api/knowledge-edges/${sourceId}/${targetId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error(`Delete knowledge edge failed: ${response.status}`)
  }
  return response.json()
}
