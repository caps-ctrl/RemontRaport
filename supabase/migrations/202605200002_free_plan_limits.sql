create schema if not exists private;

revoke all on schema private from anon, authenticated;

create or replace function private.is_pro_user(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = target_user_id
      and profiles.stripe_subscription_status in ('active', 'trialing')
  );
$$;

create or replace function private.project_count_for_user(target_user_id uuid)
returns integer
language sql
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.projects
  where projects.user_id = target_user_id;
$$;

create or replace function private.visible_image_count_for_user(target_user_id uuid)
returns integer
language sql
security definer
set search_path = ''
as $$
  select
    (
      select count(*)::integer
      from public.projects
      where projects.user_id = target_user_id
        and projects.image_path is not null
    )
    +
    (
      select count(*)::integer
      from public.project_issue_images
      where project_issue_images.created_by = target_user_id
    );
$$;

create or replace function private.raise_free_project_limit()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Plan darmowy pozwala mieć tylko 1 projekt. Przejdź na Pro, aby dodać kolejne projekty.'
    using errcode = 'P0001';
end;
$$;

create or replace function private.raise_free_image_limit()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Plan darmowy pozwala dodać maksymalnie 5 zdjęć. Przejdź na Pro, aby dodać kolejne zdjęcia.'
    using errcode = 'P0001';
end;
$$;

create or replace function private.enforce_free_project_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_pro_user(new.user_id) then
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(new.user_id::text),
    20520
  );

  if tg_op = 'INSERT' then
    if private.project_count_for_user(new.user_id) >= 1 then
      perform private.raise_free_project_limit();
    end if;

    if new.image_path is not null
      and private.visible_image_count_for_user(new.user_id) >= 5 then
      perform private.raise_free_image_limit();
    end if;
  end if;

  if tg_op = 'UPDATE'
    and new.image_path is not null
    and old.image_path is null
    and private.visible_image_count_for_user(new.user_id) >= 5 then
    perform private.raise_free_image_limit();
  end if;

  return new;
end;
$$;

create or replace function private.enforce_free_issue_image_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_pro_user(new.created_by) then
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(new.created_by::text),
    20520
  );

  if private.visible_image_count_for_user(new.created_by) >= 5 then
    perform private.raise_free_image_limit();
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_free_project_limits_on_projects on public.projects;

create trigger enforce_free_project_limits_on_projects
  before insert or update of image_path on public.projects
  for each row execute function private.enforce_free_project_limits();

drop trigger if exists enforce_free_issue_image_limits_on_project_issue_images
  on public.project_issue_images;

create trigger enforce_free_issue_image_limits_on_project_issue_images
  before insert on public.project_issue_images
  for each row execute function private.enforce_free_issue_image_limits();
