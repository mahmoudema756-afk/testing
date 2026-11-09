# Supabase setup

The browser uses only the public project URL and publishable key. Never add a service-role key to source control, Vercel, or the browser.

1. Create a Supabase project. In Authentication, enable Email and configure the production site URL and redirect URLs.
2. In SQL Editor, run supabase/migrations/202611090001_initial_schema.sql and then supabase/seed.sql.
3. Create an account through /auth. In SQL Editor, promote one trusted account using the final commented update statement in the migration.
4. In Vercel project Settings then Environment Variables, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to Preview and Production.
5. Redeploy. Visit /auth and then /submit.

## Approval flow

Uploads enter the private materials bucket in a user-specific folder. A pending database row is created after storage upload. An administrator signs in and uses the /admin page to approve or reject each row. RLS exposes approved materials, an uploader's own materials, and all materials to an administrator.

## Security

- The private bucket accepts only PDF, DOC, DOCX, PPT, and PPTX files up to 10 MB.
- Keep RLS enabled on profiles, courses, and materials.
- The publishable key is public by design and constrained by RLS. Never expose a service-role key.
- Add server-side malware scanning before accepting untrusted files at scale.
