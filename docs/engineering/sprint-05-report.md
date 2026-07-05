# Engineering Sprint 5 — Monorepo

Fecha: 4 de julio de 2026  
Estado: completado localmente.

## Resultado

Aurelis pasó de un repositorio plano a un npm workspace con límites mínimos
reales. La aplicación Expo permanece completa en `apps/mobile`, Supabase vive en
`infra/supabase` y la raíz conserva orquestación, calidad, scripts, CI y
documentación. No se crearon landing ni paquetes compartidos.

La migración fue mecánica: no cambió lógica, UI, dominio, Product Design,
Foundation ni producción.

## Estructura final

```text
/
├── apps/
│   └── mobile/
│       ├── assets/
│       ├── src/
│       ├── app.json
│       ├── eas.json
│       ├── metro.config.js
│       ├── package.json
│       ├── tailwind.config.js
│       └── tsconfig.json
├── assets/
│   └── archive/
├── docs/
├── infra/
│   └── supabase/
├── scripts/
├── package.json
└── package-lock.json
```

## Decisión

ADR 0002 fue aprobado con la alternativa 2:

- npm workspaces;
- app móvil autocontenida;
- Supabase como infraestructura;
- herramientas transversales en raíz;
- sin `apps/landing`;
- sin `packages/*` hasta existir un segundo consumidor real.

## Migración mecánica

### Mobile

Se movieron sin modificar su contenido funcional:

- `src` a `apps/mobile/src`;
- configuración Expo, EAS, Metro, Tailwind y TypeScript a `apps/mobile`;
- assets runtime a `apps/mobile/assets`;
- contrato de entorno a `apps/mobile/.env.example`.

El archivo histórico permanece en `assets/archive` porque pertenece al
repositorio y no al bundle móvil.

### Backend

El directorio Supabase completo se movió a `infra/supabase`. Los scripts raíz
usan `supabase --workdir infra`; la CLI resuelve desde ahí su directorio
convencional `supabase`.

Durante la validación se detectó que pasar `infra/supabase` como workdir hacía
que la CLI buscara un segundo `supabase/` y no aplicara migraciones. La ruta se
corrigió antes del cierre y la aceptación final mostró explícitamente las nueve
migraciones y `seed.sql`.

### Root workspace

- `package.json` raíz declara `apps/mobile` como único workspace.
- Las dependencias runtime pertenecen a `@aurelis/mobile`.
- Herramientas de calidad e infraestructura permanecen en raíz.
- Los comandos públicos existentes (`start`, plataformas, `quality`, Doctor,
  export y backend) delegan a la frontera correcta.
- ESLint, Vitest, validación de configuración y generación de tipos usan rutas
  workspace-aware.
- CI conserva los mismos comandos raíz y, por tanto, no depende de rutas
  internas de la app.

## Trazabilidad

| Cambio                      | Problema resuelto                           | Respaldo                         | Beneficio futuro                              | Riesgo evitado                             |
| --------------------------- | ------------------------------------------- | -------------------------------- | --------------------------------------------- | ------------------------------------------ |
| npm workspace mínimo        | app e infraestructura compartían raíz       | ADR 0002; Audit monorepo fase 2  | añadir consumidores sin volver a mover mobile | cambiar gestor y estructura a la vez       |
| `apps/mobile` autocontenida | ownership de Expo/assets ambiguo            | ADR 0002; Audit fase 3           | EAS/Metro tienen project root explícito       | assets o autolinking dependientes del cwd  |
| `infra/supabase`            | backend mezclado con producto móvil         | ADR 0002; Audit fase 4           | infraestructura auditable e independiente     | scripts remotos o migraciones accidentales |
| scripts raíz delegados      | comandos podían romperse tras el movimiento | Sprint 5 regla 8                 | interfaz operativa estable para equipo y CI   | conocimiento tribal de rutas internas      |
| sin landing/packages        | no existe segundo consumidor                | Engineering Governance; ADR 0002 | arquitectura basada en necesidades reales     | abstracciones y workspaces ficticios       |

## Evidencia de aceptación

- `npm ci`: instalación limpia desde raíz, 955 paquetes instalados.
- npm workspace: `@aurelis/mobile` enlazado correctamente.
- React `19.2.3` y React Native `0.85.3`: una sola versión, deduplicadas.
- `npm run lint`: aprobado, cero warnings.
- `npm run format:check`: aprobado.
- `npm run typecheck`: aprobado desde el workspace móvil.
- Vitest: 13 archivos y 59 pruebas aprobadas.
- Cobertura: statements 81.31 %, branches 71.71 %, functions 89.85 % y lines 87.01 %.
- Validación de configuración: aprobada contra `apps/mobile/app.json` y
  `apps/mobile/eas.json`.
- Expo Doctor: 21/21 checks aprobados.
- Export web: 19 rutas estáticas, iguales al baseline.
- Expo Autolinking: modo monorepo detectado correctamente.
- Supabase local: nueve migraciones aplicadas desde cero y seed ejecutado.
- Tipos Supabase: regenerados sin diferencias.

## Dependencias

La instalación limpia reportó 12 vulnerabilidades moderadas transitivas del
toolchain Expo ya observadas en Sprint 2. No se ejecutó `npm audit fix --force`
porque implicaría cambios incompatibles con Expo SDK 56. No existen findings
high ni critical.

## Desviaciones

No hubo desviaciones respecto de ADR 0002. El ajuste de `--workdir infra` es la
forma requerida por Supabase CLI para conservar físicamente la infraestructura
en `infra/supabase`; no cambia el límite aprobado.

## Producción

No se consultó ni modificó producción. ADR 0001 y todas sus restricciones
continúan vigentes. No se ejecutó reset remoto, migration repair ni `db push`.

## Commits

- `docs: propose monorepo workspace boundaries`
- `docs: approve monorepo workspace boundaries`
- `chore: migrate app and backend into workspaces`
- `chore: align monorepo operational paths`
- `docs: report sprint five monorepo migration`
