# Aurelis — Análisis del estado actual

> Auditoría realizada el 2 de julio de 2026. La referencia funcional es `origin/main` en el commit `88a20a2` (`cambio de dependencias`). El checkout local estaba un commit detrás, en `d05ce92`; el único cambio remoto adicional afecta `eas.json` y `package-lock.json`. No se modificó el código durante esta auditoría.
>
> Alcance y límite de evidencia: el repositorio conserva únicamente migraciones incrementales de Supabase a partir de `202606290002`; la migración inicial fue retirada deliberadamente porque producción ya posee el esquema base. Por ello, este documento distingue entre lo demostrado por el cliente y las migraciones versionadas, y aquello que no puede comprobarse completamente sin inspeccionar el proyecto remoto de Supabase.

# 1. Resumen Ejecutivo

Aurelis es actualmente una aplicación Expo/React Native para gestionar repertorio musical personal y colaborativo. Permite trabajar como invitado con persistencia local o con una cuenta Supabase; crear canciones con letra, acordes o notas de viento; transportarlas; crear programas manualmente o desde texto pegado; y colaborar dentro de organizaciones con roles, integrantes, instrumentos y materiales específicos por instrumento.

El producto tiene un recorrido funcional de extremo a extremo y una identidad visual consistente. Sin embargo, sigue siendo una versión previa a publicación pública: la capa de datos depende de un esquema remoto que no está completamente reproducido en Git, la sincronización no es realmente offline-first en todos los flujos, varios módulos sólo tienen pruebas unitarias y faltan controles operativos propios de producción.

# 2. Estado del Proyecto

| Módulo | Estado | Evaluación actual |
|---|---|---|
| Arranque y navegación | ✅ Terminado | Existe un gate de sesión, navegación por tabs y stack, rutas modales y deep link para recuperación de contraseña. |
| Autenticación | ✅ Terminado | Registro, inicio de sesión, confirmación por correo, cierre de sesión, recuperación y cambio de contraseña están conectados a Supabase Auth. |
| Modo invitado | ✅ Terminado | Tiene ámbito local propio y puede crear canciones y programas sin cuenta. |
| Perfil básico | 🟡 Parcial | Muestra identidad, correo, organizaciones e instrumentos; no permite editar nombre, correo o preferencias desde la pantalla de perfil. |
| Instrumentos personales | 🟡 Parcial | La UI y el servicio permiten múltiples instrumentos y uno principal; dependen de la migración incremental `user_instruments` y de Supabase. No existe equivalente local para invitado. |
| Biblioteca personal | 🟡 Parcial | Lista, busca, filtra, crea, edita y retira canciones. “Favoritas” existe como filtro de modelo, pero no hay acción visible para marcar/desmarcar ni persistencia remota de favoritos. “Pública” cambia visibilidad, pero no existe explorador de canciones públicas. |
| Biblioteca de organización | ✅ Terminado | Lista canciones, permite alta según rol, apertura, edición autorizada y material por instrumento. Depende completamente de Supabase. |
| Editor de canciones | ✅ Terminado | Admite título, autor opcional, tonalidad, notación, tipo de contenido, visibilidad, instrumento fuente y contenido textual; normaliza claves y genera versión. |
| Versiones de canción | 🟡 Parcial | Cada guardado inserta una nueva fila numerada y conserva instrumento fuente, pero no existe UI de historial, comparación, restauración o edición de una versión concreta. |
| Motor musical | ✅ Terminado | Incluye transposición de acordes, bajos, notación americana/latina, líneas de acordes, secuencias de viento y transporte entre instrumentos. Tiene pruebas unitarias. |
| Programas personales | 🟡 Parcial | Se crean, ordenan, importan y visualizan localmente. Incluso con cuenta permanecen locales; no hay sincronización remota, edición posterior ni eliminación visible. |
| Programas de organización | 🟡 Parcial | Se crean y consultan remotamente, con elementos libres o vinculados. No hay edición completa posterior ni acción visible de eliminación, aunque existe servicio de borrado. |
| Importación de programas | ✅ Terminado | Parsea mensajes, elimina prefijos, detecta encabezado y vincula por coincidencia exacta o parcial; conserva elementos no encontrados como texto libre. |
| Organizaciones | 🟡 Parcial | Creación, listado y detalle funcionan. No hay edición o eliminación de la organización, transferencia de propiedad ni configuración avanzada. |
| Miembros y roles | 🟡 Parcial | Se agrega una cuenta existente por correo, se cambian roles y se elimina un miembro. No existe invitación pendiente, aceptación, expiración ni reenvío. |
| Instrumentos de organización | ✅ Terminado | Owner/admin pueden asignar varios instrumentos del catálogo y marcar uno principal por miembro. |
| Material por instrumento | 🟡 Parcial | Se crea/actualiza una parte por canción e instrumento y se adapta a otro instrumento; no hay listado/edición explícita de todas las partes ni eliminación. |
| Permisos de cliente | 🟡 Parcial | Hay helpers claros para roles, pero parte de la autoridad real reside en RLS/RPC externos que no pueden auditarse por completo desde este repositorio. |
| Supabase | 🟡 Parcial | Auth, tablas, relaciones, RPC y RLS se utilizan. El esquema base no está versionado aquí y varias capacidades dependen de aplicar migraciones incrementales en orden. |
| Persistencia local | ✅ Terminado | AsyncStorage persiste auth local, canciones y programas por ámbito invitado/usuario. |
| Sincronización | 🟡 Parcial | Canciones personales se suben y descargan; organizaciones usan consultas remotas. No hay cola robusta, reintentos persistentes, resolución de conflictos ni sincronización de programas personales. |
| Offline | 🟡 Parcial | Invitado y datos ya persistidos localmente funcionan. Organizaciones, instrumentos personales y la mayoría de operaciones autenticadas requieren Supabase. |
| EAS Build | 🟡 Parcial | Hay perfiles development, preview y production y proyecto EAS asociado. Falta evidencia versionada de build validado, credenciales, variables de producción, submit configurado y bundle identifier de iOS. |
| Calidad automatizada | 🟡 Parcial | TypeScript estricto y 53 pruebas unitarias pasan. No hay ESLint configurado, pruebas de componentes, integración, E2E, RLS o dispositivos. |
| Observabilidad y operación | 🔴 Pendiente | No se encontraron analítica, crash reporting, logging estructurado, monitoreo, feature flags ni CI/CD versionado. |

# 3. Arquitectura actual

## Stack

- Expo SDK `56.0.12`, React Native `0.85.3`, React `19.2.3` y React Native Web `0.21.2`.
- TypeScript `6.0.3` con `strict`, `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`.
- Expo Router `56.2.11` con rutas tipadas y React Compiler experimental habilitado.
- Supabase JS `2.108.2` para Auth, PostgreSQL/PostgREST y RPC.
- Zustand `5.0.14` para estado local y persistencia mediante AsyncStorage.
- TanStack Query `5.101.2` para lectura, cache e invalidación de datos remotos.
- React Hook Form y Zod en el editor de canciones; otros formularios usan estado local o validaciones de React Hook Form.
- StyleSheet de React Native como sistema visual principal. NativeWind/Tailwind está configurado, pero no se usa en los componentes revisados.
- Vitest para pruebas unitarias de lógica pura.

La referencia oficial de Expo SDK 56 indica React Native 0.85, React 19.2.3 y Node mínimo 22.13.x; las versiones principales del proyecto están alineadas con esa matriz.

## Estructura

- `src/app`: rutas y pantallas Expo Router. Las pantallas contienen composición visual y una parte importante de la coordinación de datos.
- `src/components`: componentes reutilizables generales y de UI.
- `src/features`: lógica por dominio (`auth`, `songs`, `setlists`, `organizations`, `music-engine`).
- `src/store`: stores Zustand para acceso, canciones, programas, reproductor/presentación y toasts.
- `src/lib`: cliente Supabase, abstracción de AsyncStorage y fechas.
- `src/types`: modelo de dominio compartido.
- `src/constants`: tokens visuales.
- `supabase/migrations`: sólo migraciones incrementales sobre un esquema de producción preexistente.
- `docs/branding`: documentación de marca existente.
- `assets`: iconos, splash, favicon y recursos del template Expo.

## Navegación

La raíz monta `GestureHandlerRootView`, `SafeAreaProvider`, `QueryClientProvider`, StatusBar y ToastHost. `AppGate` rehidrata acceso local, verifica sesión Supabase, cambia el ámbito de almacenamiento y redirige a `/auth` si no hay acceso.

La navegación principal usa cuatro tabs: Inicio, Biblioteca, Setlists y Perfil. El Stack añade canción, editor, autenticación, recuperación, creación/detalle de organización, creación/detalle de programa y editor de material. Los editores y creadores se presentan como modales; el resto usa navegación de pantalla completa.

## Dependencias

Dependencias activamente visibles en el código: Expo Router, StatusBar, Splash Screen, Linking, Linear Gradient, Google Fonts, DateTimePicker, AsyncStorage, Supabase, TanStack Query, Zustand, React Hook Form, Zod, Gesture Handler, Safe Area Context y Draggable FlatList.

Dependencias instaladas sin uso encontrado en `src`: `@expo/ui`, `@shopify/react-native-skia`, `expo-constants`, `expo-device`, `expo-glass-effect`, `expo-haptics`, `expo-image`, `expo-symbols`, `expo-system-ui`, `expo-web-browser`, `react-native-reanimated` y `react-native-worklets`. Algunas pueden ser transitivas o reservas del template, pero hoy aumentan superficie de mantenimiento sin funcionalidad demostrable.

No hay una carpeta de hooks personalizados. Los hooks de React, Zustand y TanStack Query se utilizan directamente dentro de pantallas y componentes.

# 4. Funcionalidades implementadas

## Acceso y autenticación

- Gate inicial de sesión y rehidratación.
- Registro con nombre, correo y contraseña.
- Inicio de sesión con correo y contraseña.
- Mensajes amigables para errores comunes de Auth.
- Confirmación de cuenta por correo cuando Supabase no entrega sesión inmediata.
- Recuperación de contraseña por deep link `aurelis://`.
- Restablecimiento de contraseña y validación de coincidencia.
- Cierre de sesión, limpieza de cache remota y cambio de ámbito local.
- Continuar como invitado sin Supabase.
- Persistencia de sesión Supabase con refresh automático.

## Inicio

- Saludo con nombre o modo invitado.
- Fecha localizada a español de México.
- Selección del próximo programa entre programas locales y de organizaciones.
- Resumen de canciones y músicos del programa.
- Acceso rápido a nueva canción y biblioteca/transposición.
- Lista de hasta tres canciones personales recientes.
- Estados vacíos accionables.

## Biblioteca personal

- Separación de canciones personales respecto de canciones de organización.
- Búsqueda por título o artista.
- Filtros Todas, Favoritas, Públicas y Privadas.
- Conteo de resultados.
- Alta de canción.
- Apertura de canción.
- Estado textual de sincronización según modo de acceso.

## Canciones y editor

- Creación y edición local/remota.
- Título obligatorio y autor opcional.
- Tonalidades mayores y menores con sostenidos y bemoles.
- Normalización de nombres americanos y latinos, incluyendo expresiones como “Mi menor”.
- Tonalidad vacía representada como `null` en Supabase.
- Contenido de letra y acordes, sólo acordes o notas de viento.
- Notación americana o latina.
- Selección de instrumento fuente del material.
- Ayuda contextual y muestras editables.
- Visibilidad privada o pública en biblioteca personal; visibilidad de organización forzada en contexto de organización.
- `content_structured` construido como array JSONB consistente para `songs` y `song_versions`.
- Inserción de versión correlativa (`max(version) + 1`).
- Rollback local ante error autenticado y limpieza intentada de canciones nuevas incompletas.
- Retiro remoto mediante RPC de soft delete.

## Visualización y ejecución musical

- Render de líneas de acordes, letra, melodía y espacios.
- Compatibilidad con acordes inline entre corchetes y formato de líneas alineadas.
- Transporte manual por semitonos.
- Transporte de raíces, modificadores e inversiones/bajos.
- Escala tipográfica ajustable.
- Modo de presentación con mayor espacio superior.
- Contenido seleccionable.

## Programas personales y de organización

- Creación manual.
- Creación mediante mensaje pegado.
- Fecha opcional con selector nativo y campo web.
- Notas generales.
- Elementos libres sin canción de biblioteca.
- Vinculación opcional a canciones existentes.
- Coincidencia automática por título normalizado.
- Reordenamiento por drag en nativo y flechas en web.
- Eliminación de elementos durante la creación.
- Tonalidad seleccionada copiada desde la canción y normalizada antes de Supabase.
- Soporte de tonalidades menores en `setlist_items` mediante migración incremental.
- Vista de detalle, orden, notas y recursos vinculados.
- Vinculación posterior de un elemento libre a una canción.
- Fallback compatible con programas legacy basados en `songIds`.

## Organizaciones

- Tipos: iglesia, banda, escuela, coro, grupo y proyecto personal.
- Creación con nombre, slug automático/editable y tipo.
- Registro del creador como owner mediante una segunda operación, con rollback si falla.
- Listado de organizaciones del usuario.
- Pantalla con secciones Biblioteca, Programas e Integrantes.
- Biblioteca remota por organización.
- Programas remotos por organización.
- Conteos y estados de carga/vacío.

## Miembros, roles y acceso

- Alta directa de una cuenta existente por correo.
- Roles owner, admin, director, musician y representación de guest en dominio.
- Cambio de rol para miembros no owner.
- Eliminación de miembros por owner.
- Helpers para liderazgo, administración y alta de canciones.
- RPC con `security definer`, grants y revokes para administración de miembros.

No hay un sistema de invitaciones real: no existen en el cliente estados pending/accepted/expired, enlace de aceptación ni pantalla de invitaciones. “Agregar por correo” incorpora inmediatamente una cuenta ya registrada.

## Instrumentos

- Catálogo compartido con instrumentos en C, Bb, Eb y F.
- Offset escrito por instrumento.
- Instrumentos personales múltiples y uno principal.
- Instrumentos de organización múltiples por miembro y uno principal.
- Opción “Otro”.
- Default efectivo Concert cuando no hay instrumento fuente/destino.

## Material por instrumento y transporte

- Alta/actualización de material específico en `song_instrument_parts`.
- Tonalidad escrita sugerida desde la tonalidad de concierto.
- Contenido textual y notas por instrumento.
- Selección de parte exacta para el instrumento del músico o adaptación desde la primera parte disponible.
- Transporte desde instrumento fuente hacia destino mediante diferencia de offsets.
- Prevención de doble transporte cuando fuente y destino coinciden.
- Convención implementada: C/concert = 0, Bb = +2, Eb = +9 y F = +7.

## Feedback y utilidades

- Toast global success/error/warning/info con autocierre.
- Formateo y validación de fechas ISO.
- Mensajes de error y estados vacíos en los flujos principales.
- Compatibilidad web estática y controles específicos de plataforma para fecha y reordenamiento.

# 5. Flujo completo del músico

1. Al abrir Aurelis, el gate rehidrata el modo de acceso, consulta la sesión Supabase y muestra un loader hasta resolver ambos estados.
2. Sin acceso previo, el músico llega a autenticación. Puede registrarse, iniciar sesión o continuar como invitado.
3. Como invitado, entra a un ámbito AsyncStorage aislado. Como usuario autenticado, entra a un ámbito local `user:{id}`, carga perfil, intenta sincronizar canciones pendientes de ese ámbito y descarga sus canciones personales remotas.
4. En Inicio ve su siguiente programa y accesos rápidos. En Biblioteca ve únicamente sus canciones personales locales/remotas fusionadas.
5. Puede crear una canción seleccionando tipo, notación, tonalidad e instrumento para el cual ya está escrito el material. Como invitado se conserva localmente. Como autenticado se escribe `songs` y después `song_versions`; si falla, no se comunica un falso éxito local.
6. Abre la canción para leerla, transportarla manualmente, cambiar tamaño y activar presentación. Si tiene autorización, puede abrir el editor y guardar otra versión.
7. Desde Perfil puede configurar instrumentos personales si tiene cuenta. También puede crear o abrir organizaciones.
8. En una organización ve biblioteca, programas e integrantes según su rol. Puede crear canciones de organización; owner/admin administran miembros, roles e instrumentos. Un miembro no se invita: debe existir previamente y se agrega directamente por correo.
9. Un usuario autorizado puede añadir material específico por instrumento a una canción de organización.
10. Para preparar un programa, el músico crea una lista manual o pega un mensaje. Añade canciones vinculadas o títulos libres, define orden, fecha y notas. Los programas personales quedan en el dispositivo; los de organización se escriben en Supabase.
11. En el detalle del programa, Aurelis selecciona el instrumento principal personal u organizacional. Para cada canción usa material específico si existe; en caso contrario calcula el delta desde `sourceInstrumentName` hacia el instrumento destino y abre la canción con ese transporte.
12. Los elementos libres pueden vincularse posteriormente a una canción para habilitar contenido y recursos.

# 6. Estado de Supabase

## Auth

Supabase Auth está integrado para email/password, confirmación por correo, sesión persistente, refresh token, recuperación y cambio de contraseña. En web se activa `detectSessionInUrl`; en nativo la recuperación procesa manualmente tokens del deep link.

## Tablas utilizadas por el cliente

- `user_profiles`: perfil y nombre visible.
- `user_instruments`: instrumentos personales; creada por migración incremental.
- `organizations`: organizaciones.
- `organization_members`: membresías y roles.
- `instruments`: catálogo.
- `member_instruments`: asignaciones dentro de organizaciones.
- `songs`: canción base y contenido vigente.
- `song_versions`: historial técnico de guardados e instrumento fuente.
- `song_instrument_parts`: material específico por instrumento.
- `setlists`: programas de organización.
- `setlist_items`: orden, snapshot, vínculo, tonalidad y notas.

El esquema conocido del proyecto remoto también contempla `setlist_item_assignments`, `member_song_notes`, `setlist_private_notes` y `saved_transpositions`, pero el cliente actual no realiza consultas ni escrituras sobre esas tablas. No hay funcionalidad observable respaldada por ellas.

## RPC y funciones

- Usadas por el cliente: `add_organization_member_by_email`, `set_organization_member_role`, `get_organization_members` y `soft_delete_song`.
- Referenciadas por migraciones/políticas: `is_org_member` y `has_org_role`.
- El esquema remoto conocido incluye además `can_view_song`, `can_manage_song`, `can_view_setlist`, `can_manage_setlist` y `touch_updated_at`; no son invocadas directamente desde el cliente revisado.

## RLS y políticas

Las migraciones versionadas configuran acceso propio para `user_instruments`, grants restringidos para RPC de miembros y políticas de lectura/inserción/soft delete para canciones. La migración de instrumentos personales restringe SELECT/INSERT/UPDATE/DELETE a `user_id = auth.uid()`.

No es posible certificar toda la matriz RLS porque las definiciones iniciales de tablas y políticas no están en el repositorio. La seguridad final depende del estado real del proyecto Supabase y de que todas las migraciones incrementales estén aplicadas.

## Migraciones

El repositorio incluye ocho archivos de migración incremental:

1. RPC de administración de miembros.
2. Elementos libres y `title_snapshot` en programas.
3. Tipos ampliados de organización.
4. Catálogo de instrumentos predeterminados.
5. Soft delete y políticas de canciones.
6. Opción “Otro”.
7. Instrumento fuente, claves menores e instrumentos personales.
8. Claves mayores y menores en elementos de programa.

No existe una migración inicial versionada. `supabase/README.md` indica expresamente que producción es dueña del esquema y que no debe recrearse.

## Storage, Realtime y Edge Functions

No se encontró uso de Supabase Storage, buckets, carga de archivos, Realtime channels, Presence, Broadcast ni Edge Functions. Todo el contenido musical es texto/JSON y vive en PostgreSQL o AsyncStorage.

## Qué falta o no puede verificarse

- Tipos TypeScript generados desde Supabase; actualmente predominan mapeos manuales y `any`.
- Snapshot reproducible del esquema completo.
- Pruebas automatizadas de RLS/RPC.
- Confirmación versionada de que las migraciones se aplicaron en preview/production.
- Transacciones reales para operaciones compuestas.
- Observabilidad de errores de PostgREST/Auth.

# 7. Estado Offline

## Qué funciona sin red

- Arranque en modo invitado después de rehidratar AsyncStorage.
- CRUD local de canciones invitadas, excepto capacidades que explícitamente consultan Supabase.
- Creación, orden y consulta de programas personales locales.
- Lectura y transporte de canciones ya presentes en el store local.
- Preferencias efímeras de presentación durante la ejecución actual.
- Separación de datos locales entre `guest` y cada `user:{id}`.

## Qué se guarda localmente

- `accessMode` y usuario mínimo de sesión en `aurelis-access-v1`.
- Canciones por ámbito en `aurelis:{scope}:songs`.
- Programas personales por ámbito en `aurelis:{scope}:setlists`.
- La sesión Supabase mediante la misma abstracción AsyncStorage.

El estado de transporte, escala de fuente y presentación vive sólo en memoria y no se persiste.

## Qué se sincroniza

- Canciones personales autenticadas: alta/edición de `songs`, creación de `song_versions`, descarga al iniciar sesión y fusión por `remoteId`.
- Canciones, programas, miembros, instrumentos y materiales de organización: se consultan directamente mediante TanStack Query; no se persiste el cache de Query.

## Límites reales

- Los programas personales de una cuenta no se sincronizan con Supabase.
- Los instrumentos personales dependen de Supabase y no tienen cache persistente propio.
- No hay detector de conectividad, cola duradera, backoff, estado “offline” ni botón de reintento.
- La sincronización automática se ejecuta al cambiar/iniciar sesión, no como worker continuo.
- El flujo de login cambia primero al ámbito `user:{id}` y después busca canciones locales pendientes; las canciones del ámbito `guest` no se migran explícitamente. Por ello, la afirmación del README de que las canciones invitadas se intentan sincronizar al iniciar sesión no está respaldada por el flujo actual.
- Una escritura autenticada fallida se revierte localmente en el editor. Esto evita falso éxito, pero significa que ese flujo no es offline-first.
- El cache de organizaciones se pierde al reiniciar y requiere red.

# 8. Base de Datos

`auth.users` es la identidad raíz. `user_profiles` mantiene atributos públicos del usuario y `user_instruments` guarda preferencias instrumentales personales con unicidad por nombre y un índice único parcial para un solo principal.

`organizations` pertenece a un owner y se relaciona con usuarios mediante `organization_members`. Cada membresía tiene un rol. `member_instruments` vincula la membresía con el catálogo `instruments`, conserva clave de transposición y marca principal. Este modelo separa correctamente el instrumento personal del instrumento asignado dentro de una organización.

`songs` contiene la identidad y versión vigente de una canción: propietario, organización opcional, título, artista, claves, contenido crudo, contenido estructurado y visibilidad. `song_versions` pertenece a una canción y registra número correlativo, clave, contenido, creador e instrumento fuente. `song_instrument_parts` relaciona canción e instrumento para almacenar una parte específica, su clave escrita, contenido y notas.

`setlists` pertenece a una organización en el flujo remoto actual. `setlist_items` pertenece a un setlist, tiene posición única, vínculo opcional a canción, snapshot de título, tonalidad seleccionada y notas. El vínculo opcional permite conservar programas aunque una línea no exista todavía en la biblioteca.

Los programas personales no tienen entidad remota en el cliente actual: reutilizan el modelo de dominio `Setlist`, pero se almacenan como JSON en AsyncStorage.

Las tablas remotas conocidas para asignaciones de items, notas privadas y transposiciones guardadas no tienen integración en el cliente, por lo que sus relaciones funcionales no pueden describirse más allá de su nombre sin inventar comportamiento.

# 9. Pantallas

| Ruta | Propósito | Estado | Funcionalidades actuales |
|---|---|---|---|
| `/(tabs)` | Contenedor principal | ✅ | Cuatro tabs, barra inferior oscura y navegación tipada. |
| `/(tabs)/index` | Inicio | ✅ | Saludo, próximo programa, accesos rápidos, canciones recientes y estados vacíos. |
| `/(tabs)/library` | Biblioteca personal | 🟡 | Búsqueda, filtros, listado y alta. Favoritos y público sólo están parcialmente materializados. |
| `/(tabs)/setlists` | Lista de programas | ✅ | Mezcla programas locales y de organizaciones, acceso a creación manual/importada y detalle. |
| `/(tabs)/profile` | Perfil y equipo | 🟡 | Identidad, organizaciones, instrumentos personales, instrumentos organizacionales y acceso a cuenta. Sin edición general de perfil. |
| `/auth` | Acceso y cuenta | ✅ | Login, registro, confirmación, recuperación, invitado, sesión conectada y logout. |
| `/reset-password` | Nueva contraseña | ✅ | Procesa sesión/deep link, valida y actualiza contraseña. |
| `/editor` | Crear/editar canción | ✅ | Formulario completo, validación, instrumento fuente, persistencia y retiro. |
| `/song/[id]` | Ejecutar canción | ✅ | Render musical, transporte, tamaño, presentación y acceso condicionado a edición. |
| `/organization/create` | Crear organización | ✅ | Nombre, slug, tipo, guardado y validación de cuenta. |
| `/organization/[id]` | Espacio de organización | 🟡 | Biblioteca, programas, integrantes, roles e instrumentos. Sin edición/eliminación del espacio ni invitaciones formales. |
| `/setlist/create` | Crear programa | ✅ | Manual/importado, fecha, notas, elementos libres/vinculados, orden y persistencia local/remota según contexto. |
| `/setlist/[id]` | Ver programa | 🟡 | Orden, notas, instrumento, transporte, materiales y vinculación. Sin edición integral o eliminación visible. |
| `/material/editor` | Material por instrumento | 🟡 | Selección de instrumento, clave sugerida, contenido y notas. No carga explícitamente una parte existente ni ofrece borrado/listado. |

# 10. Componentes reutilizables

- `Button`: variantes primary, secondary y ghost, estado compacto/disabled y feedback de presión.
- `Screen`: SafeArea, encabezado, eyebrow, título, subtítulo, acción derecha, ancho máximo y scroll opcional.
- `SectionTitle`: encabezado de sección con acción opcional.
- `SongRow`: fila estándar de canción con índice, metadata, tonalidad y navegación con transporte inicial opcional.
- `ToastHost`: capa global para mensajes transitorios de cuatro tipos.
- `DateField`: abstracción multiplataforma; DateTimePicker en nativo e `<input type="date">` en web.

El conjunto es pequeño y útil, pero muchas tarjetas, chips, inputs, barras de navegación, estados vacíos y selectores se implementan directamente en cada pantalla. No existe una biblioteca completa de formularios, modal, card, chip, empty state o typography.

# 11. Estado del diseño

## Consistencia

La experiencia tiene una dirección visual reconocible: fondo casi negro, superficies grises, vino como primario, rojo rosado como acento y texto cálido. Las pantallas comparten radios amplios, bordes discretos, eyebrows en mayúsculas y jerarquía consistente.

## Paleta y tokens

`design.ts` centraliza colores, espaciados y radios. No obstante, numerosas pantallas contienen hexadecimales y valores de tamaño directos, por lo que el tokenizado es parcial. Tailwind replica parte de la paleta, pero las clases NativeWind no se usan.

## Tipografía

La marca usa Cormorant Garamond únicamente en Auth. El resto declara `fontFamily: 'serif'`, que depende de la plataforma y no garantiza la misma apariencia. El cuerpo usa fuentes del sistema y el contenido musical usa monospace, una decisión adecuada para alineación.

## Espaciado y responsive

Los tokens de 4–48 px y anchos máximos de 480–760 px generan buena adaptación a móvil y web. Safe areas, scroll inferior para tabs y controles flotantes están contemplados. Algunos archivos concentran estilos extensos y valores repetidos.

## Animación

Hay animaciones de transición del Stack y microfeedback de escala/opacidad en botones. No se encontraron animaciones de contenido, skeletons o transiciones del toast. Reanimated y Worklets están instalados sin uso explícito.

## UX

Fortalezas: buenos estados vacíos, ayuda contextual musical, mensajes en español, preservación de elementos libres, confirmación destructiva de canciones/miembros y alternativas web/nativo.

Limitaciones: varios errores remotos se muestran directamente; no hay estados de error/reintento consistentes para queries; algunas operaciones no presentan confirmación o progreso granular; los elementos interactivos basados en símbolos pueden ser ambiguos; la cobertura de accessibility labels es irregular; y no hay edición integral de programas después de crearlos.

# 12. Deuda técnica

## Alta

1. **Esquema base no reproducible.** El repositorio no puede crear ni auditar por sí solo la base completa; esto aumenta riesgo de drift entre cliente, preview y producción.
2. **Sin pruebas de integración con Supabase/RLS.** Los errores recientes de constraints muestran que las pruebas unitarias no validan el contrato real de PostgreSQL.
3. **Sincronización invitado→cuenta no implementada de forma efectiva.** El cambio de scope descarta de memoria el ámbito guest antes de ejecutar la subida del ámbito de usuario.
4. **Operaciones compuestas no transaccionales.** Crear organización+owner, crear song+version y crear setlist+items son secuencias cliente con rollback compensatorio. En edición de canción, `songs` puede actualizarse y fallar la versión sin revertir la actualización.
5. **Cleanup incompatible potencial con soft delete.** Ante fallo al crear versión se intenta un DELETE directo de `songs`, mientras la migración elimina la policy de delete y declara que el borrado debe pasar por `soft_delete_song`; la limpieza puede fallar.
6. **Offline autenticado incompleto.** No existe cola ni resolución de conflictos; varias escrituras autenticadas se pierden del borrador local al fallar.
7. **Cobertura de seguridad incompleta en Git.** No se puede verificar la totalidad de RLS y funciones del esquema remoto.

## Media

1. Uso frecuente de `any` al mapear respuestas Supabase; no hay tipos generados.
2. `organization-service.ts` concentra múltiples dominios y responsabilidades.
3. Duplicación de reglas de offsets entre `music-engine/instruments.ts` e `organizations/instrument-material.ts`.
4. Programas personales no se sincronizan y los programas remotos no se almacenan offline.
5. No hay UI de historial de versiones pese a generar una versión por guardado.
6. No hay UI real de invitaciones; el alta por email requiere cuenta existente.
7. Visibilidad pública sin catálogo/descubrimiento público.
8. Favoritos presentes en modelo/filtro, pero sin interacción ni persistencia remota.
9. Servicio de eliminación de setlist existe, pero no se usa en pantallas; tampoco hay edición posterior completa.
10. Notas generales se encapsulan dentro de `source_text` como JSON por compatibilidad, mezclando dos conceptos.
11. Errores de varias queries se omiten o sólo producen listas vacías; falta un modelo uniforme de error.
12. Lógica de coordinación considerable vive en pantallas grandes (`organization/[id]`, `setlist/create`, `editor`).
13. El README describe una estrategia local-first que ya no coincide completamente con el editor autenticado.

## Baja

1. Dependencias instaladas sin uso observable.
2. NativeWind configurado pero StyleSheet domina por completo.
3. Tipografía serif no determinista fuera de Auth.
4. No existe configuración ESLint aunque hay script `expo lint`.
5. Estilos y componentes visuales repetidos.
6. Iconografía basada principalmente en caracteres Unicode.
7. Mezcla de formatos de código: algunos archivos muy compactos y otros formateados en múltiples líneas.
8. Metadata del dominio contiene placeholders (`Por definir`, `peopleCount: 0/1`) que no provienen de datos reales.

# 13. Riesgos

## Escalabilidad

Las listas de canciones, miembros, partes y programas se consultan sin paginación. `listInstrumentMaterials` descarga partes de todas las canciones vinculadas y luego filtra/adapta en cliente. El `REMOTE_SONG_SELECT` incluye todas las versiones para elegir la última en memoria. Estos patrones crecerán en costo con repertorios y organizaciones grandes.

## Mantenimiento

El contrato de datos está escrito como strings de select y mapeos `any`. La falta de esquema generado y de tests contra Supabase hace probable que un cambio de columna o constraint vuelva a romper flujos. Las reglas musicales duplicadas pueden divergir.

## Dependencias

Expo SDK 56 y React Compiler están en una generación reciente. Varias dependencias nativas y visuales no usadas amplían el área de compatibilidad de builds. El proyecto exige Node 22.13.x según Expo 56, pero no hay `.nvmrc`, `.node-version` ni `engines` en `package.json`.

## Seguridad

La seguridad depende de RLS remota no completamente versionada. Las RPC `security definer` están restringidas explícitamente, lo cual es positivo, pero requiere auditoría del esquema desplegado. La anon key del perfil preview está versionada en `origin/main/eas.json`; no es un secreto administrativo, pero fija un backend concreto en el repositorio y exige que RLS sea correcta. No hay evidencia de threat modeling, rate limits de negocio o auditoría de acciones administrativas.

## Sincronización

No hay versionado optimista, ETags, timestamps comparados ni estrategia de conflictos. La fusión por `remoteId` puede conservar duplicados locales que nunca obtuvieron id remoto. Los fallos se silencian en `pullRemoteSongs` y `syncLocalSongs`, de modo que el usuario no sabe qué quedó pendiente.

## Base de datos

Aplicar sólo parte de las migraciones deja al cliente consultando tablas/columnas inexistentes o enviando valores rechazados. La migración de constraints descubre y elimina checks por columna, lo que requiere especial cuidado al aplicarse sobre variantes del esquema. No hay proceso versionado que demuestre qué migraciones existen en cada ambiente.

## Producto y operación

No hay crash reporting, métricas, soporte in-app, política de privacidad visible, borrado de cuenta, exportación de datos ni automatización de releases. Sin estas piezas, los fallos de campo serían difíciles de detectar y atender.

# 14. Lo mejor construido

1. **El dominio musical está separado y probado.** Transposición, notación, melodías, instrumentos y parsing viven fuera de React y tienen pruebas deterministas.
2. **La separación instrumento fuente/destino resuelve un problema musical real.** El modelo evita doble transporte y permite adaptar material Bb↔Eb↔Concert.
3. **Los programas toleran la realidad operativa.** Una canción puede existir como texto libre y vincularse después; no se obliga a limpiar la biblioteca antes de planificar un evento.
4. **La experiencia invitado tiene aislamiento de datos.** Los scopes evitan mezclar datos entre invitado y diferentes usuarios en el mismo dispositivo.
5. **El sistema visual ya tiene personalidad.** Paleta, superficies, jerarquía editorial y presentación musical se sienten parte del mismo producto.
6. **TypeScript está configurado con rigor.** `strict`, optional exactos y acceso indexado seguro elevan la calidad del código.
7. **Las migraciones recientes son incrementales.** No recrean tablas ni borran datos y explicitan intención.
8. **Hay protección de permisos en dos capas conceptuales.** El cliente oculta acciones según rol y Supabase aplica RLS/RPC.
9. **La adaptación multiplataforma es pragmática.** Fecha y reordenamiento tienen implementaciones web/nativas apropiadas.
10. **Los flujos destructivos principales tienen intención conservadora.** Canciones usan soft delete y miembros requieren confirmación.

# 15. Lo que todavía falta para una versión 1.0 pública

- [ ] Versionar o generar un snapshot verificable del esquema completo de Supabase sin poner en riesgo producción.
- [ ] Confirmar y automatizar la aplicación de todas las migraciones en development, preview y production.
- [ ] Añadir pruebas de integración para Auth, RLS, RPC, constraints y operaciones compuestas.
- [ ] Resolver de forma demostrable la migración de datos guest hacia una cuenta.
- [ ] Definir una estrategia consistente para fallos offline autenticados y conflictos.
- [ ] Sincronizar programas personales o comunicar de forma inequívoca que son sólo locales.
- [ ] Completar edición y eliminación de programas.
- [ ] Validar historial/versiones de canciones y decidir qué control expone la UI.
- [ ] Completar o retirar de UI/modelo Favoritas y descubrimiento Público.
- [ ] Completar el flujo de invitaciones o renombrarlo como alta directa de usuarios existentes.
- [ ] Revisar transacciones/rollbacks de canción, organización y programa.
- [ ] Generar tipos Supabase y eliminar mapeos críticos con `any`.
- [ ] Configurar lint y CI con test, typecheck y build.
- [ ] Añadir pruebas de componentes y E2E de los recorridos principales.
- [ ] Validar builds reales de Android, iOS y web.
- [ ] Completar configuración EAS de producción, variables, credenciales y submit.
- [ ] Definir bundle identifier de iOS y verificar metadata/iconos finales.
- [ ] Incorporar crash reporting y logging de errores remotos.
- [ ] Revisar accesibilidad en todas las acciones, inputs y estados.
- [ ] Actualizar README para reflejar el comportamiento real.
- [ ] Preparar requisitos de publicación: privacidad, soporte, borrado de cuenta y manejo de datos.

# 16. Recomendaciones

## Como Software Architect

Antes de publicar, establecería el contrato de datos como fuente de verdad: esquema versionado o snapshot generado, tipos Supabase, migraciones verificadas por ambiente y pruebas de RLS. Después convertiría las operaciones compuestas críticas en RPC transaccionales. Consolidaría la lógica de offsets en un único módulo y separaría el servicio de organizaciones por agregado: organizaciones, miembros, instrumentos, canciones y programas.

También definiría una máquina de estados de sincronización explícita (`local`, `queued`, `syncing`, `synced`, `conflict`, `failed`) con errores persistentes y reintentos. No ampliaría funcionalidad hasta demostrar que los datos no se pierden en login, logout, falta de red y escrituras parciales.

## Como Product Architect

Cerraría primero las promesas que ya aparecen en el producto: biblioteca pública, favoritos, programas personales, invitaciones y sincronización. Cada una debe completarse o retirarse temporalmente del discurso/UI. Definiría con precisión qué puede hacer invitado, cuenta personal, músico, director, admin y owner, y alinearía textos, permisos y RLS.

Para 1.0 priorizaría un recorrido estable: crear cuenta → configurar instrumento → crear/importar canción → crear programa → abrirlo transportado. Todo lo demás debería evaluarse contra la confiabilidad de ese recorrido.

## Como UX Architect

Unificaría estados de loading/error/retry y haría visible qué es local, remoto, pendiente u offline. Revisaría accesibilidad de todos los Pressable, tamaños táctiles y símbolos Unicode. Convertiría patrones repetidos en componentes de input, chip, card, empty state y section navigation. Cargaría la tipografía de marca globalmente o usaría una familia del sistema de forma consistente.

También añadiría confirmación y capacidad de recuperación para operaciones de programa, y explicaría claramente la diferencia entre “agregar miembro” e “invitar”.

## Como Mobile Architect

Validaría development builds físicos en Android/iOS, deep links de recuperación, teclado, safe areas, DateTimePicker y drag-and-drop. Fijaría la versión de Node, ejecutaría `expo-doctor`, reduciría dependencias nativas no usadas y confirmaría compatibilidad con New Architecture/React Compiler. Completaría EAS production con variables gestionadas por ambiente, identificadores, credenciales, versionado y submit probado.

Añadiría pruebas E2E de arranque frío, sesión expirada, red intermitente y rehidratación. La web está contemplada, pero debe decidirse si forma parte de 1.0 para asignarle pruebas y soporte explícitos.

# 17. Resumen Final

## ¿En qué estado real está Aurelis?

Aurelis es un MVP funcional avanzado o una beta interna temprana. Tiene producto visible, recorridos completos y un motor musical valioso, pero todavía no tiene la confiabilidad de datos, operación y pruebas necesaria para considerarse una 1.0 pública.

## ¿Qué tan cerca está de una versión pública?

Está cerca en alcance funcional y experiencia visual, pero a una distancia relevante en robustez. El trabajo pendiente no consiste principalmente en agregar pantallas: consiste en cerrar contratos de base de datos, sincronización, permisos, builds, observabilidad y pruebas integrales.

## ¿Qué tan preparada está su arquitectura para crecer?

La separación por features, el dominio tipado, Zustand/TanStack Query y el motor musical puro ofrecen una buena base. La capacidad de crecer está limitada por el esquema remoto no reproducible, servicios grandes, mapeos `any`, operaciones no transaccionales y ausencia de una arquitectura de sincronización explícita.

## ¿Qué partes consideras especialmente bien resueltas?

El motor musical, la distinción entre instrumento fuente y destino, los programas con elementos libres, el aislamiento local por usuario, la navegación y la identidad visual son las partes más sólidas. También destacan TypeScript estricto y la cobertura unitaria de lógica pura.

## ¿Cuáles requieren mayor atención?

Supabase como contrato desplegable, RLS y transacciones; sincronización guest/cuenta y offline; programas personales; historial de versiones; permisos/invitaciones; calidad automatizada de integración/E2E; EAS production; y observabilidad. Son las áreas que determinan si Aurelis puede pasar de una beta prometedora a un producto público confiable.
