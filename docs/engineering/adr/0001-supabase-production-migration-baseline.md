# ADR 0001: baseline de migraciones de producción Supabase

Estado: Aprobado — alternativa 4, 3 de julio de 2026.

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

- obtener un backup verificable;
- generar un dump/diff fresco contra producción;
- preparar una migración nueva, idempotente y forward-only únicamente para el
  delta pendiente;
- ejecutar dry-run;
- registrar explícitamente las versiones históricas aplicadas;
- validar RLS/RPC después del despliegue;
- ejecutar smoke tests;
- documentar la operación completa en el reporte del siguiente sprint.

La aprobación no autoriza un reset remoto ni un `db push` directo. La operación
de producción solo puede continuar después de satisfacer todas las condiciones.

## Impacto

Resuelve C-01 sin fingir una historia que producción no posee. Elimina el riesgo
de que futuros despliegues mezclen DDL manual con migraciones y deja una ruta
auditable para CI. No cambia tablas, dominio ni comportamiento durante Sprint 1.
