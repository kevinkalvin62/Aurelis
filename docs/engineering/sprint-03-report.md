# Engineering Sprint 3 — Architecture

Fecha: 3 de julio de 2026  
Estado: completado localmente.

## Resultado

Se redujo el acoplamiento de las dos rutas de creación más grandes y del gate
raíz sin modificar comportamiento, navegación, textos, dominio ni Product
Design. Las rutas conservan la composición visual; validación, estado y efectos
quedaron en módulos de feature con límites explícitos.

## Cambios

### Editor de canciones

- La ruta pasó de 630 a 447 líneas.
- Validación, defaults, opciones y ejemplos viven en `song-editor-model.ts`.
- Persistencia local, sincronización, permisos y navegación viven en
  `use-song-editor.ts`.
- El modelo puro tiene tres pruebas nuevas.

Deuda eliminada: una ruta ya no conoce simultáneamente formulario, dominio,
Supabase, stores, permisos y rollback. Respaldo: Gap Analysis §5 “Pantallas
Monolíticas”, auditoría de código y backlog H-01. Beneficio: Product Design podrá
cambiar la vista sin reabrir el contrato de persistencia.

### Creación de programas

- La ruta pasó de 495 a 360 líneas.
- La representación y transformación del borrador viven en `setlist-draft.ts`.
- Estado, importación, persistencia local/remota y navegación viven en
  `use-setlist-creator.ts`.
- Orden, IDs locales y mapeo remoto tienen tres pruebas nuevas.

Deuda eliminada: parser, orden visual y payload remoto dejaron de compartir una
misma unidad. Respaldo: Gap Analysis §5, auditoría H-01 y M-10. Beneficio: el
flujo de preparar un programa puede evolucionar sin duplicar reglas entre web,
nativo y Supabase.

### Gate de aplicación

- El layout raíz pasó de 125 a 68 líneas.
- Hidratación, sesión, scope local, perfil y sincronización viven en
  `use-app-session.ts`.

Deuda eliminada: navegación y ciclo de sesión ya no están entrelazados en el
provider raíz. Respaldo: inventario de componentes `RootLayout/AppGate`, backlog
H-01 y H-07. Beneficio: futuras pruebas de arranque, recuperación y offline
podrán atacar un límite único.

## Decisiones arquitectónicas

- Se conservaron rutas Expo Router como capas de composición; componentes,
  modelos y hooks permanecen fuera de `src/app`.
- No se creó una arquitectura genérica ni abstracciones anticipadas: cada
  extracción corresponde a responsabilidades ya presentes y repetidamente
  cambiantes.
- Los modelos puros se probaron; los hooks coordinan infraestructura existente
  sin alterar ownership entre Zustand y TanStack Query.
- No se modificaron tokens, copy, layout ni componentes visuales.

## Evidencia

- ESLint: cero errores y cero warnings.
- TypeScript: aprobado.
- Vitest: 13 archivos y 59 pruebas aprobadas.
- Cobertura: todos los umbrales aprobados.
- Formato y configuración: aprobados.
- Expo Doctor y export web: verificación final aprobada.

## Deuda restante

- `organization/[id].tsx` conserva 697 líneas y mezcla consultas, membresía,
  instrumentos y render. Es la siguiente prioridad H-01, pero debe dividirse en
  cortes separados para no arriesgar permisos ni mutaciones.
- `setlist/[id].tsx`, `profile.tsx` y `auth.tsx` conservan orquestación que debe
  abordarse sólo con pruebas de comportamiento suficientes.
- El ownership Query/Zustand no se redefinió; hacerlo exige una decisión
  explícita sobre offline/sync (C-03), fuera del alcance de un refactor mecánico.

## Producción

No se consultó ni modificó producción. Las restricciones de ADR 0001 continúan
vigentes. No se ejecutó reset remoto ni `db push`.

## Commits

- `refactor: separate song editor orchestration`
- `refactor: isolate setlist creation state`
- `refactor: isolate application session gate`
- `docs: report sprint three architecture baseline`
