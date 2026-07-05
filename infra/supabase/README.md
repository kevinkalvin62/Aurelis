# Backend Supabase de Aurelis

Este directorio contiene el contrato reproducible del backend. El esquema base fue
extraído del proyecto remoto el 3 de julio de 2026 y no contiene datos de usuarios.

## Requisitos

- Node.js 22 o superior.
- Docker Desktop activo.
- Dependencias instaladas con `npm ci`.

## Flujo local

```bash
npm run backend:start
npm run backend:reset
npm run backend:types
npm run backend:status
```

`backend:reset` elimina únicamente la base local, aplica las nueve migraciones en
orden y ejecuta `seed.sql`. El seed está vacío intencionalmente: la reproducción
del esquema no depende de contenido propiedad de músicos.

## Estructura

- `config.toml`: stack local compatible con PostgreSQL 17.
- `migrations/20260628000000_remote_schema.sql`: snapshot DDL del esquema público
  remoto, sin filas ni secretos.
- `migrations/20260629*` y `20260630*`: cambios incrementales existentes.
- `seed.sql`: punto de entrada explícito para datos de desarrollo futuros.
- `src/types/database.generated.ts`: tipos producidos desde el estado local final.

## Producción

El proyecto vinculado es `utfezzpwltvwaifxakeg`. Su tabla de historial remoto
estaba vacía al iniciar Sprint 1, aunque el esquema ya contenía manualmente buena
parte de las migraciones. Por eso **no se debe ejecutar `supabase db push`,
`migration repair` ni `db reset --linked`** hasta aprobar el ADR de reconciliación
en `docs/engineering/adr/0001-supabase-production-migration-baseline.md`.

Las claves `EXPO_PUBLIC_*` son configuración pública del cliente. Nunca deben
usarse en la app `service_role`, contraseñas de Postgres, tokens personales ni
claves `sb_secret_*`.
