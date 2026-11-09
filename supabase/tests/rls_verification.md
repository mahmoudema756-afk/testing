# RLS verification checklist

Run after migrations 002 and 003 on a staging copy. Use anonymous, normal
student, and existing admin browser sessions.

| Context | Required result |
| --- | --- |
| Anonymous | Reads approved active courses and approved downloads only. Cannot upload, suggest, or read private content. |
| Student | Creates owned pending suggestions and uploads only under their own Storage folder. Cannot change review fields, courses, profiles, or another user's files. |
| Admin | Creates, edits and archives courses; reviews suggestions and materials; moves materials; downloads files for review. |

Negative checks: submit duplicate normalized codes, delete a course with materials,
upload into another user's folder, insert metadata for a missing Storage object,
and open a private Storage URL anonymously. Each must fail through RLS.
