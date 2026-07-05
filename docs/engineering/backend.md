# Backend de Aurelis

Estado: baseline de Engineering Sprint 1, 3 de julio de 2026.

## Responsabilidad

Supabase proporciona autenticación, PostgreSQL, PostgREST y políticas RLS para
la colaboración autenticada. El modo invitado continúa siendo local y no depende
de este backend. Este documento describe el sistema existente; no modifica el
dominio congelado en Foundation.

## Esquema recuperado

El esquema público contiene 15 tablas:

- identidad: `user_profiles`, `user_instruments`;
- repertorio: `songs`, `song_versions`, `saved_transpositions`;
- organizaciones: `organizations`, `organization_members`, `instruments`,
  `member_instruments`;
- material: `song_instrument_parts`, `member_song_notes`;
- programas: `setlists`, `setlist_items`, `setlist_item_assignments`,
  `setlist_private_notes`.

También contiene tres enums (`content_visibility`, `organization_role`,
`organization_type`), funciones de autorización/consulta y 53 políticas RLS.
Las referencias a `auth.users` se resuelven contra el esquema administrado por
Supabase y no duplican identidades en `public`.

## Seguridad

- El cliente usa únicamente URL y publishable key.
- RLS permanece habilitado en todas las tablas expuestas.
- Las funciones `security definer` fijan `search_path` y restringen `EXECUTE`.
- No se versionaron filas, correos, tokens ni contraseñas.
- Los permisos deben validarse mediante pruebas RLS en Sprint 2; el snapshot no
  sustituye esas pruebas.

## Migraciones

La secuencia reproducible comienza en
`20260628000000_remote_schema.sql`, snapshot fiel de producción antes de aplicar
los incrementos versionados. Un reset local aplica nueve versiones y termina con
15 tablas, `songs.deleted_at` y `soft_delete_song(uuid)` disponibles.

La producción remota no tiene historial registrado en
`supabase_migrations.schema_migrations`. Además, el snapshot mostró que
`deleted_at` y `soft_delete_song` aún no existen remotamente. No se modificó
producción durante Sprint 1. La estrategia de reconciliación está aislada en un
ADR y requiere aprobación antes de cualquier despliegue SQL.

## Tipos

`npm run backend:types` genera
`apps/mobile/src/types/database.generated.ts` desde el estado local final. El
generador normaliza el final de archivo y produce salida
determinista. `createClient<Database>` convierte el esquema en contrato de
compilación para consultas, inserts, updates y RPC.

## Operación local

```bash
npm ci
npm run backend:start
npm run backend:reset
npm run backend:types
npm run typecheck
npm test
npm run backend:stop
```

`backend:reset` y `backend:stop` afectan solamente los contenedores locales.
Ningún script del repositorio usa `--linked`.

La infraestructura versionada vive en `infra/supabase`. Los comandos raíz pasan
`infra` como project workdir para que Supabase CLI resuelva su directorio
convencional `supabase`; no dependen del directorio actual.
