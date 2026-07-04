# Engineering Sprint 1 — Foundation Alignment & Technical Stabilization

Fecha: 3 de julio de 2026
Estado: completado localmente; reconciliación remota pendiente de ADR aprobado.

## Resultado

Aurelis pasó de depender de un esquema Supabase existente únicamente en remoto a
contar con un backend local reproducible, tipos generados y contratos de entorno
documentados. No se añadieron funcionalidades, no se rediseñaron experiencias y
no se modificó Foundation.

## Entregables

- snapshot completo del esquema público remoto, sin datos de usuarios;
- secuencia local de nueve migraciones reproducible en PostgreSQL 17;
- configuración y seed explícitos de Supabase CLI;
- CLI 2.109.0 fijada como dependencia de desarrollo;
- tipos TypeScript generados de 15 tablas, enums, relaciones y RPC;
- cliente Supabase parametrizado con `Database`;
- variables públicas/secretas clasificadas y perfiles EAS completados;
- documentación de backend, arquitectura y entorno;
- ADR para reconciliar de forma segura el historial remoto vacío.

## Decisiones y trazabilidad

| Cambio | Problema resuelto | Respaldo | Deuda eliminada | Beneficio futuro |
|---|---|---|---|---|
| Snapshot base versionado | producción no podía recrearse desde Git | Gap C-01; Audit Critical C-01 | esquema base ausente | onboarding, CI y recuperación repetibles |
| Reset local validado | migraciones incrementales dependían de objetos previos | Sprint 1; audit backend no reproducible | secuencia no verificable | cambios DB probables antes de producción |
| Tipos generados | mappers/RPC dependían de `any` y contratos manuales | Gap “tipos generados”; Audit deuda 4 | divergencia DB/TypeScript | errores detectados durante compilación |
| Validación de persistencia | cliente enviaba null a campos obligatorios | esquema recuperado; estabilidad técnica | fallos remotos silenciosos | fronteras de datos confiables |
| Plantilla env desacoplada | desarrollo apuntaba por defecto a producción | Sprint 1 variables; Expo/Supabase docs | acoplamiento de entorno | desarrollo local seguro |
| ADR de baseline remoto | historial remoto vacío y drift parcial | Foundation Governance; regla ADR | riesgo de `db push` destructivo | despliegue SQL auditable |

## Evidencia de validación

- Supabase local: PostgreSQL 17, stack healthy.
- `backend:reset`: nueve migraciones aplicadas desde cero.
- Esquema final: 15 tablas públicas.
- RPC final: `soft_delete_song(uuid)` presente.
- Columna final: `songs.deleted_at` presente.
- `backend:types`: salida SHA-256 estable en regeneraciones consecutivas.
- `npm run typecheck`: aprobado.
- `npm test`: 11 archivos, 53 pruebas aprobadas.
- `expo config --type public`: SDK 56 reconocido y configuración válida.
- `eas.json`: JSON válido; preview y production tienen variables públicas.
- Escaneo del repositorio: sin `sb_secret_*`, contraseñas DB ni service-role key.

## Estado remoto observado

El proyecto `utfezzpwltvwaifxakeg` está `ACTIVE_HEALTHY`. Su esquema ya contenía
la mayoría de los incrementos, aparentemente aplicados fuera del historial CLI.
La tabla de migraciones remota no registra versiones y faltan el soft-delete y su
RPC. Sprint 1 no mutó producción.

## Riesgo aceptado / siguiente aprobación

No debe ejecutarse `supabase db push` contra producción hasta aprobar
`ADR 0001`. Tras aprobación se requiere backup, diff fresco, migración
forward-only, dry-run y smoke tests de RLS/RPC.

## Commits del sprint

- `docs: establish foundation governance`
- `chore: make supabase schema reproducible`
- `refactor: enforce generated supabase contracts`
- documentación/entornos: commit final de Sprint 1

## Fuera de alcance

- nuevas funcionalidades y cambios de dominio;
- rediseño visual o Product Design;
- CI/ESLint/E2E y pruebas RLS (Sprint 2);
- refactor de pantallas (Sprint 3);
- monorepo (Sprint 5);
- modificación de datos o políticas en producción.
