# Supabase

The production project already owns the Aurelis schema. Do not recreate it.

`migrations/202606290002_app_workflows.sql` is incremental and only adds atomic workflow functions required by the mobile client. It contains no table creation, table alteration, or destructive statement.
