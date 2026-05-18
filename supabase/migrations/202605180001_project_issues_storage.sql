create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.project_issues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  description text,
  location text,
  status text not null default 'Nowa',
  priority text not null default 'Normalna',
  assigned_to text,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_issues_title_not_blank check (length(trim(title)) > 0),
  constraint project_issues_status_check check (
    status in ('Nowa', 'W trakcie', 'Zakończona', 'Wstrzymana')
  ),
  constraint project_issues_priority_check check (
    priority in ('Niska', 'Normalna', 'Pilna', 'Krytyczna')
  )
);

create index if not exists project_issues_project_id_created_at_idx
  on public.project_issues (project_id, created_at desc);

create index if not exists project_issues_project_id_status_idx
  on public.project_issues (project_id, status);

create index if not exists project_issues_created_by_idx
  on public.project_issues (created_by);

drop trigger if exists set_project_issues_updated_at on public.project_issues;

create trigger set_project_issues_updated_at
  before update on public.project_issues
  for each row execute function public.set_updated_at();

alter table public.project_issues enable row level security;

drop policy if exists project_issues_select_own_project on public.project_issues;
drop policy if exists project_issues_insert_own_project on public.project_issues;
drop policy if exists project_issues_update_own_project on public.project_issues;
drop policy if exists project_issues_delete_own_project on public.project_issues;

create policy project_issues_select_own_project
  on public.project_issues
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_issues.project_id
        and projects.user_id = (select auth.uid())
    )
  );

create policy project_issues_insert_own_project
  on public.project_issues
  for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1
      from public.projects
      where projects.id = project_issues.project_id
        and projects.user_id = (select auth.uid())
    )
  );

create policy project_issues_update_own_project
  on public.project_issues
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_issues.project_id
        and projects.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.projects
      where projects.id = project_issues.project_id
        and projects.user_id = (select auth.uid())
    )
  );

create policy project_issues_delete_own_project
  on public.project_issues
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.projects
      where projects.id = project_issues.project_id
        and projects.user_id = (select auth.uid())
    )
  );

create table if not exists public.project_issue_images (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.project_issues(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint project_issue_images_storage_path_unique unique (storage_path),
  constraint project_issue_images_storage_path_not_blank check (length(trim(storage_path)) > 0)
);

create index if not exists project_issue_images_issue_id_created_at_idx
  on public.project_issue_images (issue_id, created_at desc);

create index if not exists project_issue_images_created_by_idx
  on public.project_issue_images (created_by);

alter table public.project_issue_images enable row level security;

drop policy if exists project_issue_images_select_own_project on public.project_issue_images;
drop policy if exists project_issue_images_insert_own_project on public.project_issue_images;
drop policy if exists project_issue_images_update_own_project on public.project_issue_images;
drop policy if exists project_issue_images_delete_own_project on public.project_issue_images;

create policy project_issue_images_select_own_project
  on public.project_issue_images
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.project_issues
      join public.projects on projects.id = project_issues.project_id
      where project_issues.id = project_issue_images.issue_id
        and projects.user_id = (select auth.uid())
    )
  );

create policy project_issue_images_insert_own_project
  on public.project_issue_images
  for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1
      from public.project_issues
      join public.projects on projects.id = project_issues.project_id
      where project_issues.id = project_issue_images.issue_id
        and projects.user_id = (select auth.uid())
    )
  );

create policy project_issue_images_update_own_project
  on public.project_issue_images
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.project_issues
      join public.projects on projects.id = project_issues.project_id
      where project_issues.id = project_issue_images.issue_id
        and projects.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.project_issues
      join public.projects on projects.id = project_issues.project_id
      where project_issues.id = project_issue_images.issue_id
        and projects.user_id = (select auth.uid())
    )
  );

create policy project_issue_images_delete_own_project
  on public.project_issue_images
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.project_issues
      join public.projects on projects.id = project_issues.project_id
      where project_issues.id = project_issue_images.issue_id
        and projects.user_id = (select auth.uid())
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'issue-images',
  'issue-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists issue_images_select_own on storage.objects;
drop policy if exists issue_images_insert_own on storage.objects;
drop policy if exists issue_images_update_own on storage.objects;
drop policy if exists issue_images_delete_own on storage.objects;

create policy issue_images_select_own
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'issue-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy issue_images_insert_own
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'issue-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy issue_images_update_own
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'issue-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'issue-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy issue_images_delete_own
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'issue-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
