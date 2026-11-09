-- Run after migration 002. Preserve existing rows and protect code uniqueness.
begin;
do $$
declare duplicates text;
begin
  select string_agg(normalized, ', ' order by normalized) into duplicates
  from (select upper(trim(code)) as normalized from public.courses group by upper(trim(code)) having count(*) > 1) duplicate_codes;
  if duplicates is not null then
    raise exception 'Cannot add normalized course-code uniqueness; resolve duplicates first: %', duplicates;
  end if;
end $$;
-- Discover prior code checks by definition, not assumed constraint names.
do $$
declare constraint_row record;
begin
  for constraint_row in select conname from pg_constraint where conrelid = 'public.courses'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%code%'
  loop
    execute format('alter table public.courses drop constraint %I', constraint_row.conname);
  end loop;
end $$;
alter table public.courses add constraint courses_code_format_check check (code = upper(trim(code)) and code ~ '^[A-Z0-9][A-Z0-9 -]{1,19}$') not valid;
create unique index if not exists courses_normalized_code_unique on public.courses (upper(trim(code)));
commit;
