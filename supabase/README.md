# Supabase

The production project already owns the Aurelis schema. Do not recreate it.

Apply only the incremental migrations that are missing in the remote project:

- `202606290002_app_workflows.sql` adds secure member-management helpers.
- `202606290003_setlist_free_text_items.sql` lets program items keep a title without requiring a library song.
- `202606290004_organization_types.sql` safely expands organization types for bands, schools, choirs, groups and personal projects.
- `202606300001_song_source_instruments_and_keys.sql` adds source-instrument metadata, minor-key checks and personal instruments without recreating existing tables.
- `202606300002_setlist_item_keys.sql` safely allows normalized major and minor keys in program items.

Neither migration recreates tables. Never restore or run the removed initial migration.
