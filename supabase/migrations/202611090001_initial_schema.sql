-- Schema, approval workflow, RLS, and private material storage.
create type public.app_role as enum ('student', 'admin');
create type public.material_status as enum ('pending', 'approved', 'rejected');
create type public.material_kind as enum ('lecture', 'tutorial', 'assignment', 'summary');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null default 'student',
  created_at timestamptz not null default now()
);
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z]{2,4}[0-9]{3}$'),
  title text not null, semester text not null, level text not null, description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  uploader_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  description text, resource_type public.material_kind not null,
  status public.material_status not null default 'pending',
  storage_path text not null unique, original_filename text not null,
  mime_type text not null check (mime_type in ('application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  reviewed_by uuid references auth.users(id), reviewed_at timestamptz, rejection_reason text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint review_metadata_matches_status check ((status = 'pending' and reviewed_by is null and reviewed_at is null) or (status in ('approved', 'rejected') and reviewed_by is not null and reviewed_at is not null))
);
create index materials_course_status_created_idx on public.materials(course_id, status, created_at desc);
create index materials_uploader_created_idx on public.materials(uploader_id, created_at desc);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name'); return new; end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger courses_updated_at before update on public.courses for each row execute procedure public.set_updated_at();
create trigger materials_updated_at before update on public.materials for each row execute procedure public.set_updated_at();
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.materials enable row level security;
create policy "Profiles are readable by their owner" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "Admins manage profiles" on public.profiles for update using (public.is_admin()) with check (public.is_admin());
create policy "Active courses are public" on public.courses for select using (is_active or public.is_admin());
create policy "Admins manage courses" on public.courses for all using (public.is_admin()) with check (public.is_admin());
create policy "Approved materials are public; owners see their own" on public.materials for select using (status = 'approved' or uploader_id = auth.uid() or public.is_admin());
create policy "Authenticated users submit their own materials" on public.materials for insert to authenticated with check (uploader_id = auth.uid() and status = 'pending' and reviewed_by is null and reviewed_at is null);
create policy "Admins review materials" on public.materials for update using (public.is_admin()) with check (public.is_admin());
create policy "Owners or admins may delete materials" on public.materials for delete using (uploader_id = auth.uid() or public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('materials', 'materials', false, 10485760, array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "Users upload only into their own folder" on storage.objects for insert to authenticated with check (bucket_id = 'materials' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users manage their own uploads" on storage.objects for delete to authenticated using (bucket_id = 'materials' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "Approved files are downloadable" on storage.objects for select using (bucket_id = 'materials' and (public.is_admin() or owner_id = auth.uid()::text or exists (select 1 from public.materials m where m.storage_path = name and m.status = 'approved')));

-- Promote a trusted account only after it exists:
-- update public.profiles set role = 'admin' where id = '<AUTH_USER_UUID>';
