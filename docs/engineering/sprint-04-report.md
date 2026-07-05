# Engineering Sprint 4 — Experience Foundation

Fecha: 4 de julio de 2026  
Estado: completado localmente.

## Resultado

Aurelis cuenta con una base reutilizable para estados, cabeceras modales,
etiquetas, cards y chips, además de semántica accesible mínima en controles
compartidos. Se conservaron layout, colores, copy, navegación y comportamiento.
No se modificaron Foundation, Product Design, dominio ni producción.

## Primitives incorporadas

| Primitive         | Patrón repetido eliminado                          | Integración actual                         |
| ----------------- | -------------------------------------------------- | ------------------------------------------ |
| `ExperienceState` | estados de carga/vacío como textos aislados        | material y organización                    |
| `ModalHeader`     | cuatro copias idénticas de cancelar/título/acción  | canción, programa, organización y material |
| `FieldLabel`      | tipografía y espaciado repetidos en formularios    | programa y organización                    |
| `SurfaceCard`     | borde, radio y superficie repetidos                | integrantes de organización                |
| `Chip`            | badges e indicadores seleccionables independientes | instrumentos y roles                       |

`ExperienceState` acepta `empty`, `loading`, `error`, `offline` y `success`, con
título, mensaje y acción opcionales. El mensaje sigue perteneciendo a cada
experiencia; la primitive no impone copy ni anticipa la voz final.

## Tokens

Se formalizaron sin alterar valores visuales:

- mínimo táctil y `hitSlop`;
- tipografía de section/field label;
- superficie seleccionada;
- texto muted;
- color destructivo.

Esto elimina valores repetidos sin convertir el baseline visual en el Design
System definitivo.

## Accesibilidad mínima

- cabeceras con rol semántico y acciones etiquetadas;
- botones con label y estado disabled;
- chips seleccionables con estado anunciado;
- inputs principales con labels accesibles;
- selectors con estado selected;
- toast como live region con mensaje completo y acción de cierre;
- selector de fecha con valor, confirmación y limpieza etiquetados;
- `SongRow` con label e hint contextual;
- estados loading/error/success anunciables según su semántica.

No se modificaron tamaños visuales para alcanzar touch targets: se amplió el
área interactiva mediante `hitSlop` donde aplicaba.

## Trazabilidad y riesgo

| Cambio                      | Respaldo                                | Beneficio para Product Design                                  | Riesgo evitado                        |
| --------------------------- | --------------------------------------- | -------------------------------------------------------------- | ------------------------------------- |
| Estados reutilizables       | Design System §6; Empty States; Gap §5  | implementar copy/acciones por contexto sobre un contrato único | loaders, errores y vacíos divergentes |
| Modal header                | Design System §4; Audit M-02            | cambiar la presentación modal una sola vez                     | cuatro variantes accidentales         |
| Field labels, cards y chips | Design System §4-5; Audit M-01/M-02     | variantes futuras sobre primitives ya integradas               | abstraer componentes sin uso real     |
| Tokens mínimos              | Design System §5; Gap “tokens visuales” | sustituir el baseline sin buscar valores hard-coded            | drift visual durante Product Design   |
| Semántica accesible         | Design System §7; Audit H-09            | accesibilidad como requisito del componente                    | correcciones pantalla por pantalla    |

## Decisiones de alcance

- No se reemplazaron todos los patrones de una sola vez; sólo duplicaciones con
  contratos equivalentes y uso demostrado.
- No se reescribieron mensajes existentes. `27-empty-states.md` podrá aplicarse
  posteriormente sobre `ExperienceState` sin rehacer cada pantalla.
- La lógica de permisos, membresías, instrumentos y mutaciones de
  `organization/[id].tsx` permaneció intacta.
- No se introdujeron animaciones, iconos, variantes visuales ni nuevos flujos.

## Evidencia

- ESLint: cero errores y cero warnings.
- TypeScript: aprobado.
- Vitest: 13 archivos y 59 pruebas aprobadas.
- Cobertura: todos los umbrales aprobados.
- Validación de configuración: aprobada.
- Expo Doctor: 21/21 checks aprobados.
- Export web: 19 rutas generadas correctamente.

## Producción

No se consultó ni modificó producción. ADR 0001 y todas sus restricciones
continúan vigentes. No se ejecutó reset remoto ni `db push`.

## Commits

- `refactor: establish reusable experience primitives`
- `refactor: strengthen shared control semantics`
- `docs: report sprint four experience foundation`
