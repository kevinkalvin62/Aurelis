# Engineering Sprint 2 — Quality

Fecha: 3 de julio de 2026  
Estado: completado localmente; CI preparado para ejecutarse al publicar la rama.

## Resultado

Aurelis cuenta con compuertas reproducibles para lint, formato, tipos, pruebas,
cobertura, configuración, Expo Doctor, export web y backend local. No se añadió
funcionalidad, no se rediseñó la experiencia, no se cambió el dominio y no se
modificó producción.

## Entregables

- ESLint 9 con configuración flat oficial de Expo SDK 56 y cero warnings;
- política Prettier reproducible, limitada al código y documentación de ingeniería;
- 53 pruebas unitarias ejecutadas automáticamente con umbrales de cobertura;
- validación de identificadores nativos, perfiles EAS y secretos prohibidos;
- Expo Doctor fijado como dependencia de desarrollo;
- workflow de GitHub Actions para aplicación y backend reproducible;
- auditoría de dependencias y eliminación de seis paquetes directos sin uso;
- identificador iOS explícito para hacer verificable la configuración nativa.

## Compuertas

`npm run quality` ejecuta:

1. ESLint sin warnings;
2. comprobación de formato;
3. TypeScript sin emisión;
4. Vitest con cobertura y umbrales;
5. validación de configuración y variables públicas.

CI añade Expo Doctor, export web, restauración de Supabase desde cero y
verificación de que los tipos generados no divergen del esquema.

## Cobertura

La cobertura se aplica al núcleo puro ya existente, sin falsear métricas con
pantallas no aisladas que corresponden al trabajo arquitectónico posterior.

| Métrica    | Resultado | Umbral |
| ---------- | --------- | ------ |
| Statements | 81.31 %   | 80 %   |
| Branches   | 71.71 %   | 70 %   |
| Functions  | 89.85 %   | 85 %   |
| Lines      | 87.01 %   | 85 %   |

## Dependencias

Se eliminaron `@shopify/react-native-skia`, `expo-device`, `expo-haptics`,
`expo-image`, `expo-system-ui` y `expo-web-browser`: no tenían imports ni uso en
configuración. Se conservaron dependencias declaradas por Expo Router y los
plugins presentes en `app.json`, aunque la aplicación no los importe de forma
directa.

`npm audit --offline` reportó cero vulnerabilidades conocidas en el lockfile
final. No se usó `audit fix --force` ni se alteró la versión mayor del SDK.

## Trazabilidad

| Cambio                     | Problema resuelto                   | Respaldo               | Deuda eliminada           | Beneficio futuro                      |
| -------------------------- | ----------------------------------- | ---------------------- | ------------------------- | ------------------------------------- |
| ESLint y formato           | calidad dependía de revisión manual | Gap 30 §CI; Audit H-03 | estilo no verificable     | cambios pequeños y consistentes       |
| CI de app y backend        | no existía validación por commit    | Gap 30; Audit H-02     | regresiones tardías       | feedback automático antes de integrar |
| Cobertura con umbrales     | tests no tenían mínimo exigible     | Gap 30; Audit H-02     | cobertura degradable      | protege el núcleo musical             |
| Validador de configuración | IDs y secretos podían divergir      | Sprint 2; Audit H-05   | configuración implícita   | builds reproducibles y más seguros    |
| Depuración de paquetes     | bundle y mantenimiento innecesarios | Audit L-01             | seis dependencias sin uso | upgrades más pequeños                 |

## Evidencia de validación

- `npm run quality`: aprobado.
- ESLint: cero errores y cero warnings.
- TypeScript: aprobado.
- Vitest: 11 archivos y 53 pruebas aprobadas.
- Cobertura: todos los umbrales aprobados.
- Validador de configuración: aprobado.
- Expo Doctor: 21/21 checks aprobados.
- Export web: 19 rutas estáticas generadas correctamente.
- Auditoría npm offline: cero vulnerabilidades conocidas.
- Backend local: nueve migraciones aplicadas desde cero, seed ejecutado y tipos
  generados sin diferencias.

## Producción y ADR 0001

ADR 0001 permanece aprobado con la alternativa 4. Sprint 2 no accedió ni mutó
producción. Antes de cualquier cambio remoto siguen siendo obligatorios: backup
verificable, dump/diff fresco, migración idempotente y forward-only del delta,
dry-run, registro de versiones históricas, validación RLS/RPC, smoke tests y
documentación. Continúan prohibidos el reset remoto y el `db push` directo.

## Riesgos y trabajo posterior

- Las pruebas de RLS/RPC por rol y los smoke tests remotos requieren el flujo
  controlado de ADR 0001; no se simularon contra producción.
- Las pruebas de componentes, integración y E2E continúan en backlog H-04/M-10;
  aislar pantallas y servicios pertenece al Sprint 3.
- CI queda listo, pero su ejecución remota sólo existirá después de publicar la
  rama en el proveedor Git.

## Commits del sprint

- `docs: approve supabase baseline reconciliation`
- `style: establish application formatting baseline`
- `chore: enforce deterministic quality gates`
- `ci: verify application and backend quality`
- `docs: report sprint two quality baseline`
