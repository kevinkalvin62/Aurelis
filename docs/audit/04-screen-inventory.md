# Aurelis — screen inventory y archivo visual

## Método y límites

Capturas verificadas en Expo Web local, viewport móvil 430×932, usando una sesión Supabase real proporcionada por el propietario. No se almacenaron credenciales en el repositorio y no se creó, editó ni eliminó contenido. La evidencia muestra datos ya existentes: perfil, canciones personales, organización, programas, integrantes e instrumentos. Los correos visibles forman parte de la UI real y deben tratarse como material interno, no como assets públicos sin anonimización. No existe onboarding independiente ni comunidad pública en el corte actual.

## Inventario

| Pantalla/ruta | Flujo y propósito | Estado observado | Captura |
|---|---|---|---|
| Auth `/auth` | entrada, login, registro, recuperar y continuar invitado | Login real verificado; formularios archivados sin credenciales | `01-auth-login.png`, `02-auth-register.png` |
| Inicio `/` | siguiente programa, acciones rápidas y repertorio reciente | Autenticado: programa remoto de 12 canciones y repertorio personal | `20-real-home.png` |
| Biblioteca `/library` | búsqueda, filtros y apertura/alta de canciones | 2 canciones sincronizadas; búsqueda vacía verificada | `21-real-library.png`, `34-real-library-empty-search.png` |
| Canción `/song/[id]` | leer, transportar, escalar y presentar | Canción real abierta; missing/error bajo sesión real | `22-real-song.png`, `35-real-song-error.png` |
| Editor `/editor` | crear/editar/eliminar canción y versionar | Modal autenticado abierto sin guardar cambios | `29-real-new-song-editor.png` |
| Setlists `/setlists` | separar próximos, personales y de organizaciones | 2 programas remotos visibles | `23-real-setlists.png` |
| Detalle setlist `/setlist/[id]` | orden, notas, instrumento, material y vínculo | Programa real abierto; 12 canciones en el principal | `24-real-setlist-detail.png` |
| Crear setlist `/setlist/create` | manual/pegado, fecha, orden y vínculo de canciones | Modal autenticado abierto sin guardar | `30-real-setlist-create.png` |
| Perfil `/profile` | identidad, instrumentos, organizaciones y sesión | Perfil sincronizado, organización e instrumentos reales | `25-real-profile.png`, `31-real-profile-instruments.png` |
| Reset `/reset-password` | consumir deep link y cambiar contraseña | Implementada; no se ejecutó cambio de contraseña | `37-real-reset-password.png` |
| Crear organización `/organization/create` | nombre, slug y tipo | Modal autenticado abierto sin crear registros | `33-real-organization-create.png` |
| Organización `/organization/[id]` | biblioteca, programas, integrantes, roles/instrumentos | 3 canciones, 2 programas y 2 integrantes verificados | `26-real-organization-library.png`, `27-real-organization-programs.png`, `28-real-organization-members.png` |
| Material `/material/editor` | parte por instrumento, clave, contenido y notas | Abierto desde una canción real; no se guardaron cambios | `32-real-material-editor.png` |
| Layout tabs | Inicio, Biblioteca, Setlists, Perfil | Funcional con sesión persistente | visible en `20`, `21`, `23`, `25` |

## Estados especiales

- **Loaders:** consulta de organización archivada en `36-real-organization-loader.png`; gate raíz y mutaciones son transitorios.
- **Vacíos:** búsqueda sin coincidencias verificada en la biblioteca real. Otros vacíos se confirmaron por código, sin alterar datos para provocarlos.
- **Errores:** canción inexistente archivada bajo sesión autenticada; no se forzaron errores remotos ni mutaciones destructivas.
- **Modales:** editor de canción, crear setlist, crear organización y material; en web conservan presentación de pantalla completa.
- **Confirmaciones nativas:** eliminación usa `Alert` y no es reproducible en captura web.

## Archivo

El archivo autenticado está en `assets/archive/screens/` con prefijos `20-real-` a `37-real-`. Los recorridos son `assets/archive/videos/03-authenticated-navigation.webm` y `04-authenticated-collaboration.webm`. Los WebM son recorridos visuales del estado auditado (transición entre capturas), no grabaciones de un dispositivo físico; no deben usarse como evidencia de rendimiento o animación nativa.
