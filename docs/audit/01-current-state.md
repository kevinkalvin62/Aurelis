# Aurelis — estado actual del repositorio

Fecha de corte: 3 de julio de 2026. Alcance: checkout local completo y recorrido autenticado contra el proyecto Supabase configurado, sin modificar comportamiento ni datos. La matriz técnica se contrastó con la [referencia oficial de Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/): SDK 56 corresponde a React Native 0.85, React 19.2.3 y Node mínimo 22.13.x.

## Resumen ejecutivo

Aurelis es una app móvil/web Expo para organizar repertorio musical personal y colaborativo. El corte actual ya forma un MVP vertical: acceso invitado o Supabase, canciones, transposición, programas/setlists, organizaciones, miembros, instrumentos y material específico. La experiencia local es funcional; la colaboración depende de un esquema Supabase remoto que el repositorio no puede reconstruir por sí solo.

Estado global: **MVP funcional, previo a producción**. TypeScript y pruebas unitarias están sanos; faltan reproducibilidad del backend, E2E, CI, observabilidad, accesibilidad y evidencia de builds de tienda.

## Estructura completa

```text
Aurelis/
├── src/
│   ├── app/                         # 14 rutas + layouts Expo Router
│   │   ├── (tabs)/                  # Inicio, Biblioteca, Setlists, Perfil
│   │   ├── song/[id].tsx            # visor musical
│   │   ├── setlist/{create,[id]}.tsx
│   │   ├── organization/{create,[id]}.tsx
│   │   ├── material/editor.tsx
│   │   ├── auth.tsx, reset-password.tsx, editor.tsx
│   │   └── _layout.tsx
│   ├── components/                  # SongRow + 6 primitivas UI y DateField por plataforma
│   ├── constants/design.ts          # colores, espaciado y radios
│   ├── features/
│   │   ├── auth/                    # perfiles e instrumentos personales
│   │   ├── music-engine/            # notación, transporte e instrumentos
│   │   ├── organizations/           # permisos, CRUD remoto y materiales
│   │   ├── setlists/                # parser, selección, claves y persistencia remota
│   │   └── songs/                   # mapeo y sincronización
│   ├── lib/                         # fechas, storage, cliente Supabase
│   ├── store/                       # 5 stores Zustand + cambio de scope
│   └── types/domain.ts
├── supabase/migrations/             # 8 migraciones incrementales; no esquema base
├── assets/                          # iconos Expo + archivo de auditoría
├── docs/{branding,foundation,product,audit}/
├── scripts/reset-project.js
├── app.json, eas.json               # Expo/EAS
├── metro.config.js, tailwind.config.js, tsconfig.json
└── package.json, package-lock.json
```

También existen `.expo/`, `dist/` y `node_modules/` como artefactos locales no enumerados archivo por archivo. `docs/foundation/` y `docs/product/20-product-readiness.md` ya eran archivos no versionados antes de esta auditoría y no fueron alterados.

## Tecnologías y dependencias

- Expo `~56.0.12`, Expo Router `~56.2.11`, React Native `0.85.3`, React/React DOM `19.2.3`, RN Web `~0.21.0`.
- TypeScript `~6.0.3` en modo estricto, rutas tipadas y React Compiler experimental.
- Supabase JS `^2.108.2` para Auth, PostgREST y RPC.
- Zustand `^5.0.14` + AsyncStorage `2.2.0` para estado local persistente.
- TanStack Query `^5.101.2` para consultas/cache remota.
- React Hook Form `^7.80.0` y Zod `^4.4.3`.
- Gesture Handler, Safe Area Context, Reanimated y Draggable FlatList.
- UI Expo: fonts, gradient, image, splash, status bar, symbols, glass effect, etc.
- NativeWind/Tailwind configurados, aunque las pantallas usan casi exclusivamente `StyleSheet`.
- Vitest `^4.1.9`, coverage V8, Prettier; no hay ESLint configurado.

Dependencias sin uso directo encontrado en `src`: `@expo/ui`, Skia, Expo Constants, Device, Glass Effect, Haptics, Image, Symbols, System UI, Web Browser, Reanimated y Worklets. Algunas sostienen otras librerías, pero deben justificarse antes de conservarlas.

## Arquitectura encontrada

Arquitectura por capas pragmática:

1. `src/app` concentra navegación, composición y bastante orquestación.
2. `features` contiene lógica de dominio y adaptadores Supabase.
3. `store` conserva auth local, canciones, programas, reproducción y toasts.
4. `lib` aísla infraestructura básica.
5. `types/domain.ts` funciona como contrato compartido manual.

La estrategia de datos es híbrida. Invitado usa AsyncStorage. Usuario autenticado mantiene canciones local-first y sincroniza con Supabase; organizaciones operan principalmente en remoto. TanStack Query y Zustand conviven sin una frontera única de ownership. El recorrido autenticado confirmó lectura efectiva de perfil, canciones personales, organizaciones, miembros, instrumentos, canciones compartidas y programas remotos.

## Módulos y servicios

| Módulo | Capacidad actual |
|---|---|
| Auth/perfil | registro, login, logout, recuperación, perfil e instrumentos personales |
| Canciones | crear/editar/eliminar lógico, mapear, versionar, sincronizar y filtrar |
| Motor musical | acordes, notación americana/latina, melodía, transposición e instrumentos transpositores |
| Setlists | creación manual/pegada, orden, items libres/vinculados, detalle y próximo programa |
| Organizaciones | creación, membresía, roles, canciones, programas e instrumentos |
| Material instrumental | partes específicas, tonalidad sugerida y adaptación |
| Infraestructura | Supabase, AsyncStorage, fechas, cache Query y toasts |

## Pantallas y navegación

Stack raíz con gate de hidratación/sesión y cuatro tabs: `/`, `/library`, `/setlists`, `/profile`. Rutas adicionales: `/auth`, `/reset-password`, `/song/[id]`, `/editor`, `/setlist/create`, `/setlist/[id]`, `/organization/create`, `/organization/[id]`, `/material/editor`. Editores/creadores se declaran modales; el resto usa stack con transición `fade_from_bottom`.

No existe onboarding separado: la pantalla de autenticación cumple la entrada inicial. No existe módulo/pantalla de comunidad general; la colaboración disponible vive dentro de organizaciones.

## Verificación

- `npm run typecheck`: pasa.
- `npm test`: 11 archivos, 53 pruebas, todas pasan.
- `npm run lint`: no evaluable; Expo detectó ausencia de configuración e intentó instalarla, pero la red restringida produjo `EACCES`. No dejó cambios.
- Web local: arranca y permite recorrer flujos de invitado.
- Sesión autenticada real: login correcto y lectura verificada de 2 canciones personales, 1 organización, 3 canciones compartidas, 2 programas, 2 miembros y asignaciones de instrumentos. La auditoría no creó, editó ni eliminó registros.
- Expo config: Android definido; iOS carece de `bundleIdentifier`. EAS tiene development/preview/production, pero no hay evidencia versionada de build o submit exitoso.

## Estado general

Fortalezas: núcleo musical probado, TypeScript fuerte, flujos locales y autenticados funcionales, identidad visual consistente y colaboración remota demostrable. Límites: pantallas demasiado grandes, backend no reproducible desde Git, sincronización parcial, escasa automatización de calidad y varias capacidades visibles aún incompletas (favoritos, historial, comunidad, edición integral de programas/organizaciones).
