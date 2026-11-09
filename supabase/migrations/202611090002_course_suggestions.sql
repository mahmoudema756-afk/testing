-- Incremental migration. Review in staging before applying to production.
-- This production schema uses app_private.is_admin(), not public.is_admin().
begin;
do $$
begin
  if to_regprocedure('app_private.is_admin()') is null then
    raise exception 'Expected app_private.is_admin() is missing; aborting without changing RLS';
  end if;
end $$;
alter table public.courses add column if not exists academic_year text;
alter table public.courses add column if not exists suggestion_status public.material_status not null default 'approved';
alter table public.courses add column if not exists suggested_by uuid references auth.users(id) on delete set null;
alter table public.courses add column if not exists review_note text;
update public.courses set suggestion_status = 'approved' where suggestion_status is null;
do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.courses'::regclass and conname = 'course_title_length') then
    alter table public.courses add constraint course_title_length check (char_length(trim(title)) between 2 and 160) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.courses'::regclass and conname = 'course_year_format') then
    alter table public.courses add constraint course_year_format check (academic_year is null or academic_year ~ '^[0-9]{4}-[0-9]{4}$') not valid;
  end if;
end $$;

-- Recreate the course policy set atomically without guessing production names.
do $$
declare policy_row record;
begin
  for policy_row in select policyname from pg_policies where schemaname = 'public' and tablename = 'courses'
  loop
    execute format('drop policy if exists %I on public.courses', policy_row.policyname);
  end loop;
end $$;
create policy "Approved courses are public" on public.courses for select
using ((is_active and suggestion_status = 'approved') or suggested_by = auth.uid() or app_private.is_admin());
create policy "Students can suggest courses" on public.courses for insert to authenticated
with check (suggested_by = auth.uid() and suggestion_status = 'pending' and is_active = false and review_note is null);
create policy "Admins manage courses" on public.courses for all to authenticated
using (app_private.is_admin()) with check (app_private.is_admin());

-- Replace only material INSERT policies. Existing production download and review
-- policies remain in place.
do $$
declare policy_row record;
begin
  for policy_row in select policyname from pg_policies where schemaname = 'public' and tablename = 'materials' and cmd = 'INSERT'
  loop
    execute format('drop policy if exists %I on public.materials', policy_row.policyname);
  end loop;
end $$;
create policy "Students submit owned material metadata" on public.materials for insert to authenticated
with check (
  uploader_id = auth.uid() and status = 'pending' and reviewed_by is null and reviewed_at is null
  and split_part(storage_path, '/', 1) = auth.uid()::text
  and exists (select 1 from storage.objects o where o.bucket_id = 'materials' and o.name = storage_path and o.owner_id = auth.uid()::text)
  and exists (select 1 from public.courses c where c.id = course_id and c.is_active and c.suggestion_status = 'approved')
);

-- Prevent course deletion from cascading into student materials.
do $$
declare fk_row record;
begin
  for fk_row in select conname from pg_constraint where conrelid = 'public.materials'::regclass and contype = 'f' and confrelid = 'public.courses'::regclass
  loop
    execute format('alter table public.materials drop constraint %I', fk_row.conname);
  end loop;
end $$;
alter table public.materials add constraint materials_course_id_fkey foreign key (course_id) references public.courses(id) on delete restrict;
create index if not exists courses_review_status_idx on public.courses(suggestion_status, is_active);
commit;
