alter table public.project_issues
  add column if not exists ai_description text;

alter table public.project_issues
  add column if not exists ai_analysis jsonb;
