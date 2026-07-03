# Aurelis — auditoría de código

## Dictamen

La base es legible y suficientemente sólida para un MVP, y el recorrido autenticado confirma que la integración remota principal funciona con datos reales. No está preparada todavía para escalar equipos y superficies. La lógica pura es la zona más madura; la orquestación de UI y la frontera local/remoto concentran la deuda.

## Organización y calidad

- Buena separación inicial entre rutas, dominio, stores, infraestructura y tipos.
- TypeScript usa `strict`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`.
- El motor musical, parser, permisos, mappers y fechas tienen 53 pruebas unitarias.
- Los nombres de dominio son claros y la mayoría de funciones remotas están agrupadas.
- La sesión real verificó consultas encadenadas de perfil, organizaciones, miembros, instrumentos, canciones y programas sin errores visibles en los happy paths recorridos.
- Los tokens visuales existen, aunque muchos valores se repiten inline.
- Las pantallas `editor.tsx` (678 líneas), `setlist/create.tsx` (540), `organization/[id].tsx` (~500), `setlist/[id].tsx` y `profile.tsx` (358) mezclan fetch, permisos, estado, mutaciones y render.

## Duplicación y consistencia

- Patrones repetidos de barra superior, cards, chips, inputs, estados vacíos, loaders y selectores.
- Formularios usan tres estrategias: React Hook Form + Zod, React Hook Form sin schema y `useState` manual.
- Colores/tipografía/tamaños aparecen tanto en `design.ts` como hard-coded en pantallas.
- Transporte instrumental está repartido entre `music-engine/instruments.ts` y `organizations/instrument-material.ts`, con conceptos y nombres cercanos.
- Mapeo de errores Supabase es local a varios servicios; no hay taxonomía común.
- Carga y mutación remota se resuelven de forma distinta por pantalla; algunas fallas se silencian retornando arrays vacíos.

## Deuda técnica

1. **Esquema de datos incompleto en Git.** Las migraciones son incrementales y dependen de tablas, enums, funciones/RLS previos.
2. **Sincronización no robusta.** No hay cola persistente, backoff, conflictos, tombstones locales ni estado de error por entidad; los setlists personales no se sincronizan.
3. **Pantallas monolíticas.** Dificultan pruebas, cambios de diseño y reutilización.
4. **Tipos remotos manuales.** Hay `any` en mapeos de organización/setlist y no existen tipos Supabase generados versionados.
5. **Calidad incompleta.** Sin ESLint, CI, pruebas de componentes/integración/E2E, cobertura publicada ni pruebas de RLS.
6. **Dependencias posiblemente ociosas.** Aumentan tiempo de instalación, superficie nativa y riesgo de upgrade.
7. **Accesibilidad no sistemática.** Faltan labels/roles/hints y validación de contraste, Dynamic Type y navegación por teclado.
8. **Observabilidad ausente.** No hay crash reporting, analytics, logging estructurado ni métricas de sincronización.
9. **Configuración de release parcial.** Sin bundle ID iOS y sin evidencia de pipeline reproducible.
10. **Operaciones sensibles no atómicas.** Crear organización + owner y guardar canción + versión son operaciones encadenadas con compensación cliente, no una transacción única.

## Riesgos

| Riesgo | Impacto | Evidencia |
|---|---|---|
| No poder recrear producción | Crítico | falta migración base y tipos generados |
| Divergencia local/remota | Alto | estrategia parcial y fallas silenciosas |
| Regresiones visuales/de flujo | Alto | cero pruebas de componentes/E2E |
| Seguridad no verificable | Alto | RLS/RPC base fuera del repo |
| Cambios lentos de Product Design | Alto | UI y lógica acopladas en rutas grandes |
| Store/cache incoherentes | Medio | Zustand y Query duplican parte del estado |
| Accesibilidad deficiente | Medio | controles simbólicos sin metadata consistente |
| Bundle/mantenimiento innecesario | Bajo/medio | dependencias instaladas sin uso directo |

## Oportunidades (sin ejecutar)

- Congelar un contrato de datos reproducible y generar tipos Supabase.
- Definir ownership: Query para remoto, stores persistentes para drafts/offline, y una capa de sync explícita.
- Extraer view-model hooks y componentes de dominio al entrar en Product Design, guiados por uso real y no por abstracción anticipada.
- Formalizar design tokens, estados y primitivas accesibles.
- Añadir una pirámide mínima: unitarias, componentes críticos, integración de sync/RLS y E2E de happy paths.
- Crear CI con typecheck, lint, test, export y validación de migraciones.
- Auditar dependencias y flags experimentales en cada upgrade de SDK.

No se corrigió ninguno de estos puntos durante la auditoría. Las pruebas automatizadas se ejecutaron sobre el código real (53/53); las verificaciones autenticadas fueron pruebas de lectura/smoke test y no mutaron datos remotos.
