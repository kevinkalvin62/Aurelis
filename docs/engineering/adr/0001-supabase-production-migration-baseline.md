# ADR 0001: baseline de migraciones de producción Supabase

Estado: Propuesto — requiere aprobación antes de modificar producción.

## Problema

Producción contiene el esquema funcional de Aurelis, pero
`supabase_migrations.schema_migrations` no registra versiones. El repositorio ya
puede recrear el backend local desde un snapshot base y ocho incrementos. Aplicar
esa secuencia directamente sobre producción intentaría recrear objetos existentes.
Marcar todo como aplicado también sería incorrecto: producción aún no contiene
`songs.deleted_at` ni `soft_delete_song(uuid)`.

## Alternativas

1. Ejecutar `db push` sobre producción sin reconciliar historial. Riesgo alto de
   colisiones y estado parcial.
2. Marcar todas las migraciones como aplicadas. Oculta el drift de soft-delete y
   deja al cliente esperando una RPC inexistente.
3. Crear un proyecto Supabase nuevo y migrar datos/usuarios. Es limpio, pero
   amplía alcance y riesgo operativo sin necesidad actual.
4. Respaldar y comparar producción, marcar como aplicadas las versiones ya
   representadas, y desplegar una migración forward-only de reconciliación para
   el delta pendiente.

## Recomendación

Elegir la alternativa 4. Antes de ejecutarla:

- obtener backup verificable;
- generar un dump fresco y compararlo con el baseline versionado;
- preparar una migración nueva, idempotente y forward-only para el delta;
- ejecutar dry-run y revisión por pares;
- registrar explícitamente las versiones históricas aplicadas;
- validar RLS/RPC y smoke tests después del despliegue.

Hasta aprobar este ADR quedan prohibidos `db push`, `migration repair` y cualquier
reset remoto.

## Impacto

Resuelve C-01 sin fingir una historia que producción no posee. Elimina el riesgo
de que futuros despliegues mezclen DDL manual con migraciones y deja una ruta
auditable para CI. No cambia tablas, dominio ni comportamiento durante Sprint 1.
