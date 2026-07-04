# Arquitectura técnica actual

Estado: baseline descriptivo de Engineering Sprint 1. No es una propuesta de
rediseño ni altera Foundation.

## Capas

1. `src/app`: rutas Expo Router, composición de pantalla y orquestación.
2. `src/components`: primitivas visuales y componentes reutilizados.
3. `src/features`: lógica de dominio y servicios por capacidad.
4. `src/store`: estado local persistente/efímero mediante Zustand.
5. `src/lib`: adaptadores de infraestructura, almacenamiento, fechas y Supabase.
6. `src/types`: dominio manual y contrato generado de base de datos.
7. `supabase`: configuración, migraciones y seed del backend local.

## Fuentes de verdad

- Foundation define producto, dominio y vocabulario.
- `src/types/domain.ts` expresa el modelo consumido por la aplicación.
- `src/types/database.generated.ts` expresa el contrato técnico de PostgreSQL.
- Las funciones mapper/service traducen entre ambos; ninguno sustituye al otro.
- TanStack Query conserva estado remoto consultable.
- Zustand/AsyncStorage conserva estado local, drafts y modo invitado.

## Fronteras

- La UI no debe construir SQL ni depender de nombres de columnas directamente.
- Los servicios de `features` son la frontera de PostgREST/RPC.
- El cliente Supabase vive únicamente en `src/lib/supabase.ts`.
- Los tipos generados no se editan manualmente.
- Las migraciones son la única fuente autorizada para recrear el esquema local.

## Deuda reconocida, fuera de Sprint 1

- ownership entre Query y Zustand aún requiere decisión explícita;
- pantallas grandes mezclan presentación y orquestación;
- no existen pruebas automatizadas de RLS ni integración;
- sync local/remoto no tiene contrato completo de conflictos;
- la migración a monorepo permanece mecánica y corresponde a Sprint 5.

Estas deudas se documentan para impedir que la infraestructura de Sprint 1 se
interprete como una arquitectura final.
