# Supabase

The production project already owns the Aurelis schema. Do not recreate it.

Apply only the incremental migrations that are missing in the remote project:

- `202606290002_app_workflows.sql` adds secure member-management helpers.
- `202606290003_setlist_free_text_items.sql` lets program items keep a title without requiring a library song.
- `202606290004_organization_types.sql` safely expands organization types for bands, schools, choirs, groups and personal projects.

Neither migration recreates tables. Never restore or run the removed initial migration.
