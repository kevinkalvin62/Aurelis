# ADR 0002 — Límites del monorepo y ownership de configuración

Estado: Propuesto  
Fecha: 4 de julio de 2026  
Decisores: Product y Engineering

## Problema

Aurelis necesita pasar de un repositorio plano a una estructura preparada para
varias aplicaciones, paquetes compartidos e infraestructura. El movimiento debe
ser mecánico, pero antes es necesario decidir:

- qué herramienta administra los workspaces;
- qué pertenece a la aplicación móvil y qué permanece en la raíz;
- dónde vive Supabase;
- si deben crearse ahora una landing y paquetes todavía sin consumidores;
- desde qué directorio se ejecutan Expo, EAS, pruebas y CI.

Sin límites explícitos, la migración podría mezclar responsabilidades, duplicar
React, depender accidentalmente del directorio de trabajo o convertir carpetas
vacías en una arquitectura ficticia.

## Contexto

- El repositorio usa npm y un único `package-lock.json`.
- Sólo existe una aplicación Expo SDK 56.
- Supabase es infraestructura versionada y no código de la aplicación.
- No existe todavía una landing ni un segundo consumidor real de dominio, UI o
  configuración compartida.
- Sprint 5 prohíbe rediseñar, mover lógica o crear arquitectura nueva.
- El plan auditado propone `apps/mobile`, `infra/supabase` y paquetes futuros,
  pero exige migración mecánica y evita compartir prematuramente.

## Alternativas

### 1. Mantener el repositorio plano

Evita churn inmediato, pero no cumple el objetivo aprobado de Sprint 5 y deja
mezclados app, herramientas e infraestructura.

### 2. npm workspaces con límites mínimos reales

- raíz: orquestación, lockfile, herramientas transversales, CI, scripts y docs;
- `apps/mobile`: app Expo completa, dependencias runtime, configuración Expo/EAS,
  `src`, assets móviles y contrato de entorno del cliente;
- `infra/supabase`: configuración, migraciones, seed y documentación del backend;
- `assets/archive`: evidencia histórica global, sin moverla a la app;
- `packages/*` y `apps/landing`: no se crean hasta existir un consumidor y una
  decisión aprobada.

La raíz delega los comandos móviles mediante `npm --workspace @aurelis/mobile` y
mantiene comandos estables (`quality`, `doctor`, `export:web`, backend) para CI y
desarrollo.

### 3. Crear desde ahora el árbol objetivo completo

Además de mover la app, crea landing y paquetes `shared`, `domain`, `ui` y
`config`. Hace visible el destino, pero introduce workspaces vacíos, ownership
sin uso demostrado y presión para extraer código durante una migración que debe
ser mecánica.

### 4. Cambiar a pnpm/Turborepo durante la migración

Puede aportar filtros y caché a futuro, pero combina reorganización con cambio de
gestor, lockfile y resolución de dependencias. Aumenta el riesgo sin un segundo
workspace que justifique esa complejidad.

## Recomendación

Aprobar la alternativa 2.

### Ownership propuesto

```text
/
├── apps/
│   └── mobile/
│       ├── assets/
│       ├── src/
│       ├── app.json
│       ├── eas.json
│       ├── metro.config.js
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── package.json
├── infra/
│   └── supabase/
├── assets/
│   └── archive/
├── docs/
├── scripts/
├── package.json
└── package-lock.json
```

### Reglas de implementación

1. npm workspaces será el gestor inicial; no se cambia el lockfile a otro gestor.
2. La aplicación móvil conserva íntegros sus imports internos y su dominio.
3. React, React Native, Expo y dependencias runtime se declaran una sola vez en
   `apps/mobile/package.json`.
4. Las herramientas de repositorio permanecen en la raíz cuando validan más de
   una frontera; la configuración estrictamente Expo vive con la app.
5. Los scripts raíz resuelven rutas absolutas desde el repositorio y no dependen
   de un `cwd` accidental.
6. Supabase se ejecuta con `--workdir infra/supabase` o equivalente documentado;
   no se altera ninguna migración.
7. Los tipos generados continúan perteneciendo a mobile porque hoy sólo mobile
   los consume.
8. CI conserva las mismas compuertas y añade instalación workspace-aware.
9. No se crean paquetes compartidos hasta que exista al menos un segundo
   consumidor real.
10. No se crea landing durante Sprint 5; requiere una decisión propia de stack,
    SEO, hosting y Product.

## Impacto

### Positivo

- separa producto móvil, infraestructura y gobierno del repositorio;
- conserva npm, el lockfile y los comandos conocidos;
- evita duplicar React/Expo;
- permite añadir futuros workspaces sin mover nuevamente la app;
- mantiene el monorepo honesto: sólo representa software que existe.

### Coste

- cambian rutas de app, assets, configuración, scripts y CI;
- EAS deberá ejecutarse desde `apps/mobile` o con su project directory explícito;
- desarrolladores y documentación deberán usar los comandos delegados de raíz.

## Riesgos y mitigaciones

| Riesgo                                   | Mitigación                                                  |
| ---------------------------------------- | ----------------------------------------------------------- |
| Metro resuelve desde una raíz incorrecta | configuración y export verificados desde el workspace móvil |
| dos copias de React                      | una sola declaración runtime y `npm ls react react-native`  |
| assets rotos                             | moverlos con app y validar `expo config`/export             |
| tipos Supabase divergen                  | generación con rutas explícitas y diff automático           |
| CI pierde cobertura                      | conservar `quality`, Doctor, export y reset local           |
| EAS usa un cwd incorrecto                | `eas.json` junto a `app.json` y documentación explícita     |
| extracción prematura                     | prohibición expresa de crear `packages/*` sin consumidor    |

## Trazabilidad

- Engineering Governance: simplicidad, abstracciones justificadas,
  reversibilidad, calidad mínima y ADR previo.
- `docs/audit/05-monorepo-plan.md`: migración mecánica, npm recomendado, app en
  `apps/mobile` e infraestructura en `infra/supabase`.
- Gap Analysis §9: preparar monorepo mediante migración mecánica.
- Sprint 5 aprobado: organización futura sin cambios de dominio, experiencia o
  Foundation.

## Criterios de aceptación posteriores

- instalación limpia desde raíz;
- scripts raíz estables;
- lint, formato, typecheck, pruebas y cobertura aprobados;
- Expo Doctor 21/21;
- export web con las mismas rutas;
- Supabase local recreado desde nueve migraciones y tipos sin drift;
- ninguna modificación funcional, visual, de dominio o de producción.
