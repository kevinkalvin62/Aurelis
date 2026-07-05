# Aurelis V1 — Auditoría de experiencia V2

Fecha: 5 de julio de 2026  
Alcance: refinamiento aprobado en `product-design-findings-plan.md`  
Comparación: prototipo auditado antes del refinamiento frente a Aurelis V1 refinado

## Resultado ejecutivo

El refinamiento reduce tiempo, incertidumbre y carga mental en los tres recorridos
priorizados. No agrega módulos, rutas, capacidades de dominio ni cambios de
producción. Home conserva su card principal; Biblioteca conserva filtros y filas;
Programa conserva permisos y mutaciones.

## Comparación de experiencia

| Recorrido | Antes | Después | Reducción conseguida |
| --- | --- | --- | --- |
| Encontrar una canción | El buscador abandonaba la vista al recorrer una biblioteca larga. La coincidencia era literal respecto a acentos. | El buscador y filtros permanecen visibles; la lista se desplaza y virtualiza de forma independiente. Título y artista se normalizan y rankean. | Menos tiempo y scroll manual. |
| Corregir una búsqueda | No existía una acción explícita para limpiar. | La consulta puede limpiarse desde el mismo campo y distingue biblioteca vacía de cero resultados. | Menos carga mental. |
| Asociar una canción a un programa | La acción “Vincular” desplegaba toda la biblioteca y obligaba a recorrerla. | “Buscar en biblioteca” abre un selector inline enfocado y prellenado con el título del item; sólo muestra coincidencias. | Menos tiempo e incertidumbre. |
| Entender un item libre | “Sin recurso vinculado” describía el sistema. | “Sin canción de la biblioteca” describe el estado musical; la confirmación y el estado positivo usan lenguaje humano. | Menos lenguaje técnico. |
| Interpretar Home | El saludo usaba el nombre completo y el CTA siempre decía “Abrir setlist”. | El saludo usa el primer nombre; el CTA dice “Prepararme” antes del evento y “Abrir programa” el mismo día, con fallback neutral. | Menos ruido y mejor contexto temporal. |
| Comprender estados vacíos | Varios casos eran textos locales que sólo informaban ausencia. | Biblioteca, búsqueda, selector y programa usan `ExperienceState` y el copy literal de Product Design. Home conserva su card con el copy aprobado. | Menos incertidumbre; siguiente paso más claro. |

## Evidencia de comportamiento

- La búsqueda cubre coincidencia exacta, prefijo y parcial de título/artista,
  consultas sin acentos y orden estable sin consulta.
- La presentación de Home cubre primer nombre, fecha futura, fecha local actual,
  fecha pasada y fecha inválida.
- El selector reutiliza las mutaciones local/remota y el cálculo de permisos
  existentes; no modifica RLS, RPC, esquema ni Supabase.
- La exportación web conserva 19 rutas, incluidas `/library`, `/setlist/[id]` y
  `/setlist/create`.
- Calidad: lint, formato, typecheck, configuración y 65 pruebas pasan. Cobertura:
  81.31% statements, 71.71% branches, 89.85% functions y 87.01% lines.

## Revisión de consistencia

- Foco: el selector solicita foco al abrir y ambos buscadores declaran intención
  de búsqueda, autocorrección desactivada y labels accesibles.
- Teclado: Biblioteca mantiene taps y descarta teclado al arrastrar la lista;
  Programa conserva su scroll y taps actuales.
- Scroll: Biblioteca elimina el scroll único que ocultaba el buscador; no cambia
  el scroll del resto de pantallas.
- Navegación: no se agregaron rutas ni se alteraron destinos.
- Loaders y animaciones: no se introdujeron cambios ni inconsistencias nuevas.
- Touch targets: las acciones nuevas reutilizan controles existentes o amplían
  el área táctil mediante `hitSlop`.

## Límites de la auditoría

La inspección interactiva automatizada en navegador no pudo ejecutarse porque la
preferencia del navegador del usuario bloquea expresamente `localhost:8081`. No
se intentó evadir esa restricción. Expo Doctor ejecutó 19 de 21 comprobaciones;
las dos restantes requieren acceso a la API de Expo y React Native Directory,
pero la elevación de red fue rechazada porque la sesión de autorización está
revocada. Son límites de verificación externa, no fallas detectadas del código.

Antes de publicar un binario se recomienda un smoke test visual en dispositivo
para Biblioteca con lista larga, teclado abierto, selector local/remoto y Home en
fecha futura/hoy. Producción permanece intacta.

## Dictamen

El alcance implementado se alinea con Product Design v1.0 y cumple el principio
rector: cada cambio reduce tiempo, incertidumbre o carga mental. No se detectó
deuda arquitectónica o de dominio nueva. Los asuntos fuera del alcance fueron
registrados, no resueltos de forma improvisada.
