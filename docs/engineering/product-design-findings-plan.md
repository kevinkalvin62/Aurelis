# Aurelis V1 — Plan de refinamiento por hallazgos de Product Design

Fecha: 5 de julio de 2026  
Estado: implementado y auditado el 5 de julio de 2026  
Fuente: Product Design v1.0 y Engineering Mission — Product Design Findings

Product aprobó las recomendaciones del plan mediante la misión de refinamiento:
`Prepararme`, `Abrir programa`, selector inline, búsqueda por título/artista y
conservación de la card actual de Home. La instrucción posterior de no crear
componentes prevalece sobre las ubicaciones tentativas: la UI de búsqueda se
implementará localmente y sólo se compartirá lógica pura.

## Objetivo

Refinar la aplicación actual para reducir el tiempo necesario para encontrar y
preparar música, sin agregar capacidades grandes, rediseñar la app, cambiar el
dominio ni modificar producción.

Este plan conserva la jerarquía visual actual. Los cambios se concentran en
búsqueda, selección, contexto temporal, lenguaje y estados ya documentados.

## Estado actual comprobado

- Biblioteca ya ofrece búsqueda por título y artista, pero toda la pantalla usa
  un `ScrollView`; el buscador deja de estar visible al recorrer repertorios
  largos.
- El flujo de una canción libre dentro de un programa muestra todas las
  canciones de la biblioteca debajo del item. No tiene consulta ni ranking.
- Home mantiene una sola etiqueta (`Abrir setlist`) sin considerar la fecha del
  programa y usa el nombre completo en el saludo.
- La UI usa “vincular/vinculada” en el flujo de programa, aunque Product Language
  prioriza lenguaje musical y humano.
- `ExperienceState` existe y soporta empty, loading, error, offline y success,
  pero varios vacíos continúan como textos o cards locales.

## Cambios propuestos

### 1. Contrato único de búsqueda de canciones

Crear una función pura compartida por Biblioteca y el selector de canciones.

Comportamiento propuesto:

- normalizar mayúsculas, espacios y acentos;
- buscar siempre por título y artista;
- priorizar coincidencia exacta de título, luego inicio de título y después
  coincidencias parciales;
- conservar el orden actual cuando la consulta esté vacía;
- permitir tonalidad como metadata opcional sólo si Product la aprueba;
- no consultar Supabase por pulsación: filtrar los datos ya disponibles.

Impacto: resultados consistentes en ambos recorridos y búsqueda instantánea sin
alterar persistencia ni backend.

Riesgos:

- una búsqueda demasiado amplia puede producir ruido;
- normalización/ranking incorrectos pueden ocultar una coincidencia esperada;
- tonalidades como `C`, `D` o `A` generan falsos positivos si se tratan como
  texto libre.

Mitigación: pruebas unitarias con acentos, artistas, coincidencias exactas,
consultas vacías y títulos similares. La tonalidad no entra al alcance inicial
sin aprobación.

Archivos previstos:

- `apps/mobile/src/features/songs/song-search.ts`;
- `apps/mobile/src/features/songs/song-search.test.ts`.

### 2. Biblioteca: búsqueda siempre disponible

Mantener el aspecto actual del buscador y los filtros, pero separar el scroll de
la lista para que la búsqueda permanezca disponible mientras el repertorio se
recorre. La lista deberá virtualizarse y desplazarse de forma independiente.

Cambios:

- extraer un `SearchField` accesible a partir del patrón visual actual;
- usar la función común de búsqueda;
- conservar filtros y `SongRow`;
- distinguir biblioteca realmente vacía de búsqueda sin resultados;
- ofrecer limpiar consulta sin crear una ruta o flujo nuevo;
- mantener foco visible y labels para teclado/lector de pantalla.

Impacto: el músico puede comenzar o corregir una consulta sin regresar
manualmente al inicio de la pantalla.

Riesgos:

- alterar insets o altura disponible en dispositivos pequeños;
- conflictos entre teclado y lista;
- pérdida de la posición actual al cambiar filtros.

Mitigación: mantener el header y estilos existentes, probar móvil/web, teclado,
safe areas y listas cortas/largas.

Archivos previstos:

- `apps/mobile/src/app/(tabs)/library.tsx`;
- `apps/mobile/src/components/ui/search-field.tsx`;
- posiblemente `apps/mobile/src/components/ui/screen.tsx`, únicamente para
  permitir contenido no-scroll sin cambiar el preset actual.

### 3. Programa: buscar una canción en lugar de recorrer la biblioteca

Reemplazar el listado completo que aparece al actuar sobre una canción libre por
un selector con búsqueda inmediata.

Corte recomendado para V1:

- conservar el selector dentro del detalle del programa para evitar una ruta
  nueva;
- abrirlo enfocado en la canción seleccionada;
- mostrar el `SearchField` y resultados filtrados/rankeados;
- cerrar al elegir, cancelar o completar la asociación;
- conservar las mismas funciones local/remota y permisos actuales;
- no crear canciones desde el selector ni modificar el programa de otra forma.

Impacto: una persona que conoce el nombre deja de recorrer toda la biblioteca y
resuelve la asociación en pocos segundos.

Riesgos:

- el panel inline puede quedar comprimido por teclado o contenido cercano;
- una canción local no sincronizada mantiene la restricción remota actual;
- modificar el selector podría tocar accidentalmente permisos o mutaciones.

Mitigación: extraer sólo presentación/consulta; reutilizar `linkItem` y sus
validaciones sin cambios; añadir pruebas de filtro y smoke tests de programa
local, organización y rol sin permisos.

Archivos previstos:

- `apps/mobile/src/app/setlist/[id].tsx`;
- `apps/mobile/src/features/setlists/setlist-song-picker.tsx`;
- `apps/mobile/src/features/songs/song-search.ts`.

### 4. Home: nombre corto y CTA temporal

#### Primer nombre

Derivar el saludo desde la primera parte no vacía de `displayName`. Mantener
`Invitado` y `Músico` como fallbacks actuales. No modificar el nombre guardado ni
el perfil.

#### CTA

Mantener íntegra la card principal, su destino y su acción. Cambiar únicamente
la etiqueta mediante una función pura basada en `serviceDate` y fecha local.

Regla técnica recomendada:

- fecha futura: contexto de preparación;
- fecha local de hoy: contexto de ejecución;
- programa sin fecha o histórico usado como fallback: etiqueta neutral actual.

La implementación no debe inferir horas porque el contrato actual no garantiza
una hora de evento confiable. Debe usar fecha ISO local para evitar cambios por
UTC.

Impacto: el Home habla del momento real sin alterar navegación ni card.

Riesgos:

- límites de zona horaria cerca de medianoche;
- `selectNextSetlist` puede devolver un programa sin fecha o histórico;
- elegir copy incorrecto puede sugerir una acción distinta de la real.

Mitigación: helper puro con fecha inyectable y pruebas para ayer, hoy, futuro y
sin fecha; fallback neutral.

Archivos previstos:

- `apps/mobile/src/app/(tabs)/index.tsx`;
- `apps/mobile/src/features/home/home-presentation.ts`;
- `apps/mobile/src/features/home/home-presentation.test.ts`.

### 5. Lenguaje del flujo de asociación

Inventariar el copy visible relacionado con `vincular`, sin renombrar tablas,
tipos, funciones internas ni conceptos del dominio. El cambio propuesto es sólo
microcopy de experiencia.

Puntos actuales:

- acción `Vincular`;
- `Sin recurso vinculado`;
- confirmación `Canción vinculada`;
- `Vinculada a biblioteca` durante creación de programa.

Dirección sugerida para revisión Product:

- acción orientada a intención: `Buscar en biblioteca`;
- estado: `Sin canción de la biblioteca`;
- confirmación: `Canción agregada desde tu biblioteca`;
- estado positivo: `Disponible en la biblioteca`.

Impacto: elimina lenguaje de relación técnica y explica qué obtiene el músico.

Riesgo: “agregar” puede confundirse con insertar un nuevo item, cuando la
operación realmente asocia una canción existente. Por ello el texto final debe
ser aprobado por Product antes de implementarse.

Archivos previstos:

- `apps/mobile/src/app/setlist/[id].tsx`;
- `apps/mobile/src/app/setlist/create.tsx`;
- pruebas/snapshots de copy sólo si se incorpora infraestructura de componentes;
  no se propone hacerlo en este refinamiento.

### 6. Empty states con `ExperienceState`

Aplicación progresiva, comenzando por las pantallas tocadas en este plan:

1. Biblioteca personal vacía.
2. Búsqueda sin resultados.
3. Programa vacío.
4. Selector sin biblioteca o sin coincidencias.
5. Home sin programas próximos, en una fase posterior si puede conservarse la
   card principal y su jerarquía.

Usar literalmente título, apoyo y acción de `27-empty-states.md` cuando exista
un caso definido. `ExperienceState` seguirá siendo la base semántica; puede
recibir la composición visual existente mediante props, sin imponer un rediseño.

Impacto: estados coherentes, orientadores y accesibles.

Riesgos:

- reemplazar una card existente por el estilo genérico puede alterar la
  jerarquía visual;
- agregar una acción puede duplicar un CTA cercano;
- “sin resultados” y “biblioteca vacía” pueden confundirse si sólo se observa el
  array filtrado.

Mitigación: separar explícitamente estado de datos y estado de consulta; mantener
el contenedor visual de cada pantalla; no aplicar Home hasta validar que su card
permanece intacta.

Archivos previstos:

- `apps/mobile/src/components/ui/experience-state.tsx` sólo si necesita una
  variante de composición sin cambiar defaults;
- `apps/mobile/src/app/(tabs)/library.tsx`;
- `apps/mobile/src/app/setlist/[id].tsx`;
- `apps/mobile/src/features/setlists/setlist-song-picker.tsx`;
- eventualmente `apps/mobile/src/app/(tabs)/index.tsx`.

## Orden de implementación

### Fase 0 — Aprobaciones Product

Cerrar las cuatro decisiones de experiencia listadas en la sección siguiente.
No bloquear la lógica pura de búsqueda ni el helper de primer nombre.

### Fase 1 — Fundamentos probados

1. Implementar y probar normalización/ranking de canciones.
2. Implementar y probar primer nombre y contexto temporal.
3. Crear `SearchField` copiando el patrón visual actual.

Gate: lint, formato, typecheck, pruebas, cobertura, Doctor y export web.

### Fase 2 — Biblioteca

1. Integrar búsqueda común.
2. Mantener buscador disponible y virtualizar lista.
3. Distinguir vacío de biblioteca y cero resultados con `ExperienceState`.
4. Validar foco, teclado, web y safe areas.

Gate de experiencia: encontrar por título/artista sin regresar al inicio;
consulta con acentos; limpiar consulta; abrir resultado correcto.

### Fase 3 — Selector de canción en programa

1. Extraer selector inline sin tocar `linkItem`.
2. Integrar búsqueda/ranking común.
3. Aplicar copy aprobado.
4. Aplicar empty state de biblioteca/sin coincidencias.

Gate de experiencia: programa local y remoto, canción sincronizada/no
sincronizada, cancelación y rol sin permisos.

### Fase 4 — Home

1. Usar primer nombre.
2. Aplicar regla temporal y copy aprobado.
3. Mantener card, acción, destino y métricas sin cambios.

Gate: snapshots/capturas comparativas de la card y pruebas de fecha.

### Fase 5 — Cierre progresivo de estados

Inventariar los empty states restantes y aplicar únicamente los casos literales
de Product Design que no alteren jerarquía ni introduzcan flujos nuevos. Cualquier
caso ambiguo vuelve a Product.

## Decisiones que requieren aprobación Product

| Decisión                               | Opciones                                                              | Recomendación Engineering | Motivo del gate                                         |
| -------------------------------------- | --------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------- |
| CTA días antes                         | `Practicar` / `Prepararme`                                            | `Prepararme`              | coincide con Musician Flow y Notifications              |
| CTA día del evento                     | `Vamos a tocar` / `Abrir programa`                                    | `Abrir programa`          | describe la acción real y evita prometer modo ejecución |
| Reemplazo de “Vincular”                | microcopy propuesta en §5                                             | aprobar como conjunto     | vocabulario visible pertenece a Product Language        |
| Presentación del buscador del programa | inline / modal o sheet                                                | inline para V1            | menor cambio; conserva contexto y navegación            |
| Metadata adicional                     | incluir tonalidad o limitar a título/artista                          | título y artista en V1    | tonalidades cortas generan ruido y requieren regla UX   |
| Home vacío                             | conservar card actual con copy nuevo / migrar a presentación genérica | conservar card            | el hallazgo exige mantener la card principal            |

No requieren aprobación adicional:

- normalización técnica de acentos/mayúsculas;
- pruebas y ranking determinista;
- virtualización de listas sin cambio visual;
- usar sólo el primer nombre, solicitado explícitamente;
- aplicar literalmente un empty state ya definido, siempre que no duplique CTA
  ni altere jerarquía.

## Validación y criterio de éxito

- El resultado correcto aparece al escribir título o artista, con acentos o sin
  ellos.
- Biblioteca no exige volver manualmente al inicio para buscar.
- El selector del programa no muestra la biblioteca completa antes de consultar.
- La asociación conserva permisos, persistencia y errores actuales.
- Home muestra primer nombre y CTA coherente con fecha local.
- La card principal de Home conserva layout, datos, destino y comportamiento.
- Empty states explican, orientan y tranquilizan usando `ExperienceState`.
- No cambian esquema, API, dominio, Foundation, Product Design ni producción.
- Todas las compuertas de Sprint 2 y el monorepo permanecen verdes.

## Fuera de alcance

- onboarding nuevo;
- notificaciones push;
- búsqueda remota o full-text en Supabase;
- historial de búsquedas, sugerencias o analytics;
- modo presentación/ejecución nuevo;
- cambios a modelos, migraciones, RLS o producción;
- rediseño general de Home, Biblioteca o Programa.
