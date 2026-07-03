# Aurelis — plan de migración a monorepo

## Objetivo

```text
apps/
├── mobile/
└── landing/
docs/
packages/
├── shared/
├── domain/
├── ui/
└── config/
assets/
infra/
└── supabase/
```

No se movió ningún archivo. El árbol final respeta el objetivo solicitado interpretando `packages/shared` como paquete transversal y dejando espacio para separar dominio/UI sólo cuando exista consumo real.

## Principios

- Migración mecánica primero; rediseño después.
- Un commit por fase, con app ejecutable y tests verdes.
- No publicar paquetes prematuramente ni compartir código exclusivo de mobile.
- Mantener una sola versión de React/React Native y validar Metro tras cada cambio.
- Resolver assets y variables de entorno explícitamente; no depender de `cwd` accidental.

## Fases

1. **Baseline:** congelar resultados de typecheck/test/export, documentar envs y obtener esquema Supabase reproducible.
2. **Workspace raíz:** elegir npm workspaces (menor cambio dado `package-lock`) y crear scripts raíz delegados.
3. **Mover mobile mecánicamente:** `src`, config Expo/Metro/Tailwind, iconos y EAS a `apps/mobile`; corregir paths sin cambiar imports internos.
4. **Mover infraestructura:** `supabase/` a `infra/supabase`; ajustar CLI/CI y documentación.
5. **Crear `packages/shared`:** empezar sólo con tipos/constantes/utilidades puras realmente compartidas. Mantener music-engine como candidato claro.
6. **Crear landing:** aplicación separada según decisión de stack; reutilizar tokens/brand assets mediante contratos estables, no imports profundos desde mobile.
7. **Config compartida:** TypeScript/Prettier/ESLint cuando al menos dos apps la necesiten.
8. **UI compartida selectiva:** sólo primitives universales; componentes React Native no deben forzarse en una landing DOM sin evaluación.
9. **CI y release:** matrices por workspace, cache, builds mobile, deploy landing y migraciones Supabase controladas.

## Mapeo propuesto

| Actual | Destino inicial |
|---|---|
| `src/**` | `apps/mobile/src/**` |
| `app.json`, `eas.json`, Metro/Tailwind | `apps/mobile/` |
| iconos/splash mobile | `apps/mobile/assets/` o `assets/brand/` según propiedad |
| `supabase/**` | `infra/supabase/**` |
| `docs/**` | `docs/**` (permanece) |
| `features/music-engine` | permanece primero; luego `packages/shared` o `packages/domain` |
| `types/domain.ts` | permanece primero; extraer cuando landing/servicios lo consuman |
| archivo visual | `assets/archive/**` (permanece global) |

## Decisiones previas

- Gestor: npm workspaces vs pnpm; se recomienda npm en la primera migración por menor churn.
- Stack de landing (Expo Web, Next u otro) y necesidad real de SSR/SEO.
- Política de paquetes: `shared` único o paquetes enfocados.
- Ownership de assets y tokens entre mobile/marketing.
- Ubicación/estrategia de `.env`, EAS y secretos.
- Si Supabase seguirá siendo backend único y cómo se versionará el esquema base.

## Riesgos y validación

Riesgos: resolución Metro, duplicación de React, rutas Expo, asset paths, NativeWind, EAS working directory y package-lock. Gates por fase: instalación limpia, `expo-doctor`, typecheck, 53 pruebas, export web, build development Android/iOS y smoke test de rutas/deep links.

