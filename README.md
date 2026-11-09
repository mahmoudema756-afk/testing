# MUST CS Materials Hub

Independent student project, not an official MUST university service.

## Development

Use Node.js 22 or newer, run `npm ci`, and configure the existing
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in
`.env.local`. Never supply a service-role key to the frontend.
Run `npm run dev`. Checks: `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Incremental database update (review required)

`supabase/migrations/202611090002_course_suggestions.sql` adds course suggestion
metadata and RLS, preserves existing approved courses, prevents cascade deletion
of their materials, and binds material submissions to owned storage objects.
It has NOT been applied to production. Back up and test it in a staging project
before application. Do not rerun the original migration or seed data.

The course code remains globally unique, including pending/rejected suggestions.
Archive courses with materials rather than deleting them. Existing users and
files are preserved. Admin roles must be assigned by a trusted administrator;
students have no profile update policy.

## Deployment

Set the two public environment variables in Vercel, configure Supabase email
redirect URLs for the deployment domain, and deploy only after reviewing SQL
and testing anonymous, student, and admin permissions against staging.
Build success alone does not establish live authentication or RLS correctness.

## Current implementation status

The catalog and course detail pages fetch approved courses and materials from
Supabase on navigation. Upload course choices are dynamic. Students can suggest
courses at /suggest; administrators manage courses, suggestions and materials at
/admin, including edits, archival, review and moving materials. Removing a
material listing retains its Storage object for recovery. Course deletion is
restricted when materials exist.

Review and apply migrations 002 then 003 in staging before deploying these
interfaces. Migration 003 supports broader course codes and adds a normalized
unique index; check existing codes for case-insensitive duplicates first.
No database updates have been executed by the implementation.

Live authentication, role isolation, Storage downloads and mutation persistence
require staging verification with anonymous, student and admin sessions. Content
updates appear on the next page visit without a deployment.
