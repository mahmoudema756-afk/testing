-- Incremental: preserves existing codes and supports student course codes beyond CS211.
begin;
alter table public.courses drop constraint courses_code_check;
alter table public.courses add constraint courses_code_check
  check (code ~ '^[A-Z0-9][A-Z0-9 -]{1,19}$') not valid;
-- Existing rows remain untouched. New or edited codes must be canonical.
create unique index courses_normalized_code_unique on public.courses (upper(trim(code)));
commit;
