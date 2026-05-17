alter table public.projects
  add column if not exists image_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists project_images_select_own on storage.objects;
drop policy if exists project_images_insert_own on storage.objects;
drop policy if exists project_images_update_own on storage.objects;
drop policy if exists project_images_delete_own on storage.objects;

create policy project_images_select_own
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'project-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy project_images_insert_own
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'project-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy project_images_update_own
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'project-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'project-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy project_images_delete_own
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'project-images'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
