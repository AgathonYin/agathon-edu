create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  role text not null check (role in ('student', 'teacher', 'admin', 'guest')),
  class_name text,
  created_at timestamptz not null default now()
);

create table if not exists knowledge_points (
  id text primary key,
  title text not null,
  module text not null,
  week int not null,
  tags text[] not null default '{}',
  description text not null,
  created_at timestamptz not null default now()
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

create index if not exists idx_knowledge_points_module on knowledge_points(module);
create index if not exists idx_exercises_knowledge_point on exercises(knowledge_point_id);
create index if not exists idx_submissions_student on submissions(student_id);
create index if not exists idx_submissions_exercise on submissions(exercise_id);
