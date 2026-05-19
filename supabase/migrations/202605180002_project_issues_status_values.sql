alter table public.project_issues
  drop constraint if exists project_issues_status_check;

update public.project_issues
set status = case status
  when 'Nowa' then 'Nie naprawiona'
  when 'W trakcie' then 'W trakcie naprawy'
  when 'Zakończona' then 'Naprawiona'
  else status
end
where status in ('Nowa', 'W trakcie', 'Zakończona');

alter table public.project_issues
  alter column status set default 'Nie naprawiona';

alter table public.project_issues
  add constraint project_issues_status_check check (
    status in ('Nie naprawiona', 'W trakcie naprawy', 'Naprawiona')
  );
