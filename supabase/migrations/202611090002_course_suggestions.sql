-- Review before applying. Never rerun the initial migration or seed on production.
begin;
alter table public.courses add column academic_year text;
alter table public.courses add column suggestion_status public.material_status not null default 'approved';
alter table public.courses add column suggested_by uuid references auth.users(id) on delete set null;
alter table public.courses add column review_note text;

-- Existing courses retain their visibility. Student suggestions share the unique
-- code constraint with published courses, avoiding races during approval.
alter table public.courses add constraint course_title_length check (char_length(trim(title)) between 2 and 160) not valid;
alter table public.courses add constraint course_year_format check (academic_year is null or academic_year ~ '^[0-9]{4}-[0-9]{4}$') not valid;
drop policy "Active courses are public" on public.courses;
create policy "Approved active courses are public" on public.courses for select
using ((is_active and suggestion_status = 'approved') or suggested_by = auth.uid() or public.is_admin());
create policy "Students suggest courses" on public.courses for insert to authenticated
with check (suggested_by = auth.uid() and suggestion_status = 'pending' and not is_active and review_note is null);

-- Prevent deletion of a course from cascading into student materials.
alter table public.materials drop constraint materials_course_id_fkey;
alter table public.materials add constraint materials_course_id_fkey foreign key (course_id) references public.courses(id) on delete restrict;
create index courses_review_status_idx on public.courses(suggestion_status, is_active);

-- Bind submitted metadata to the uploader's actual storage object.
drop policy "Authenticated users submit their own materials" on public.materials;
create policy "Authenticated users submit their own materials" on public.materials for insert to authenticated
with check (
  uploader_id = auth.uid() and status = 'pending' and reviewed_by is null and reviewed_at is null
  and split_part(storage_path, '/', 1) = auth.uid()::text
  and exists (select 1 from storage.objects o where o.bucket_id = 'materials' and o.name = storage_path and o.owner_id = auth.uid()::text)
  and exists (select 1 from public.courses c where c.id = course_id and c.is_active and c.suggestion_status = 'approved')
);
commit;
