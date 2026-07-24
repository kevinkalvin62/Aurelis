# Aurelis — Field Test 01

## Findings & Product Decisions

**Estado:** Consolidado  
**Tipo:** Field Research / Product Discovery  
**Origen:** Primera prueba de Aurelis en un entorno musical real  
**Contexto:** Presentación/ensayo con músicos y bandas, conectividad móvil inestable

---

# 1. Propósito

Este documento registra los hallazgos obtenidos durante la primera utilización de Aurelis en un entorno musical real.

No representa una lista de funcionalidades solicitadas.

No autoriza implementación inmediata.

Su propósito es preservar:

- qué ocurrió;
- qué problema reveló;
- qué necesidad musical existe detrás;
- qué decisión de producto proponemos;
- qué debe validar Engineering antes de implementar.

La prueba reveló una diferencia fundamental entre diseñar la preparación musical y acompañar la ejecución musical real.

Hasta ahora Aurelis resolvía principalmente:

> Preparar lo que vamos a tocar.

La experiencia de campo mostró que también debe resolver:

> Seguir acompañándonos cuando ya estamos ensayando o tocando.

---

# 2. Principio descubierto

La prueba dejó un principio que debe guiar las decisiones derivadas de estos hallazgos:

> **Aurelis debe adaptarse a cómo ocurre realmente la música, no pedirle a los músicos que adapten su ensayo a Aurelis.**

Un ensayo real no siempre sigue el escenario ideal.

La conexión puede fallar.

El director puede cambiar una canción.

Puede aparecer material que todavía no existe en Aurelis.

Un músico puede necesitar consultar la parte de otro instrumento.

Una tonalidad puede cambiar.

El orden puede modificarse segundos antes de tocar.

Estas situaciones no deben considerarse excepciones incómodas del sistema.

Son parte natural de hacer música en grupo.

Aurelis debe diseñarse alrededor de esa realidad.

---

# 3. Hallazgo FT01-01 — Dependencia de conectividad

## Observación de campo

Durante la prueba existía muy mala cobertura de datos móviles.

Esto provocó:

- dificultad para iniciar sesión;
- acceso intermitente cuando la señal mejoraba;
- fallos al cargar comunidades;
- dependencia de la conexión en momentos donde el músico necesitaba consultar su información.

La aplicación podía funcionar correctamente cuando existía conectividad suficiente, pero la experiencia dejaba de ser confiable cuando la señal era inestable.

## Problema

Un músico no puede asumir que tendrá buena conexión en:

- iglesias;
- auditorios;
- escenarios;
- salones;
- eventos;
- ensayos;
- espacios con mucha concentración de personas.

La conectividad no puede convertirse en requisito para ejecutar música previamente preparada.

## Decisión de producto

Aurelis debe permitir preparar contenido para utilizarlo sin conexión.

No significa replicar toda la comunidad automáticamente en cada dispositivo.

Debe existir una estrategia selectiva de disponibilidad offline.

### Experiencias consideradas

**Descargar programa**

Permitir descargar un programa junto con todo lo necesario para ejecutarlo:

- orden;
- canciones vinculadas;
- tonalidades;
- notas necesarias;
- materiales musicales;
- información esencial del programa.

**Biblioteca disponible offline**

El usuario podrá conservar localmente repertorio seleccionado cuando tenga sentido.

**Repertorio/comunidad offline**

Podrá evaluarse posteriormente la descarga de repertorios completos si existe una necesidad real.

## Principio

> La conectividad determina qué tan actualizado estás.

> No debería determinar si puedes acceder a la música que ya preparaste.

## Estado esperado

El músico debe poder identificar claramente:

> ✓ Disponible sin conexión

y conocer cuándo se actualizó por última vez.

## Prioridad propuesta

**Crítica para confiabilidad de uso real.**

## Engineering debe auditar

- persistencia actual de sesión;
- comportamiento de Supabase Auth sin red;
- caché existente;
- Zustand / AsyncStorage;
- TanStack Query;
- datos mínimos requeridos para ejecutar un programa;
- estrategia de sincronización posterior;
- almacenamiento de archivos/materiales.

---

# 4. Hallazgo FT01-02 — Acceso resiliente

## Observación de campo

Cuando la conexión era insuficiente, el inicio de sesión podía impedir temporalmente entrar a Aurelis.

## Problema

Si un músico ya utilizó Aurelis previamente en su dispositivo y preparó contenido offline, una falla temporal de internet no debería bloquear completamente el acceso a ese contenido.

## Decisión de producto

Debe diferenciarse entre:

### Primer acceso

Puede requerir conectividad para autenticar y establecer inicialmente la identidad.

### Usuario previamente autenticado

Si existe una sesión válida/persistida y contenido local disponible, Aurelis debe intentar permitir acceso a la experiencia disponible offline.

Engineering deberá determinar los límites técnicos y de seguridad antes de implementar esta decisión.

## Lenguaje esperado

Evitar:

> Error al cargar comunidad.

Cuando exista una copia válida disponible, preferir:

> Estás sin conexión.

> Mostrando la última versión disponible.

## Prioridad propuesta

**Alta / vinculada directamente al modelo offline.**

---

# 5. Hallazgo FT01-03 — Falta un modo de ejecución musical

## Observación de campo

Una vez preparado el programa, los músicos necesitan utilizarlo mientras ya están ensayando o tocando.

La experiencia actual continúa estando orientada principalmente a consultar y administrar la lista.

## Necesidad observada

Los músicos propusieron una experiencia donde:

1. el programa ya está preparado;
2. el músico pulsa una acción como `Comenzar`;
3. Aurelis abre directamente la primera canción;
4. cuando el director indica el cambio, el músico avanza a la siguiente;
5. el cambio debe ser inmediato y natural.

## Decisión de producto

Diseñar un:

# Modo Ensayo / Ejecución

La interfaz debe cambiar de intención.

Antes:

> Preparar.

Durante:

> Tocar.

## Interacción propuesta

La navegación principal entre canciones puede funcionar mediante gesto horizontal similar a una galería:

> canción actual → swipe → siguiente canción

Debe permitir:

- avanzar;
- retroceder;
- conocer la posición actual;
- consultar rápidamente la lista completa;
- acceder al material correspondiente;
- conservar tonalidad e instrumento;
- funcionar offline cuando el programa esté descargado.

Ejemplo:

> Canción 4 de 12

> Ante el Rey  
> Tono: D

> [material musical]

## Principio

> Durante la ejecución, cada interacción innecesaria compite con la música.

## Prioridad propuesta

**Alta.**

Requiere Product Design específico antes de implementación.

---

# 6. Hallazgo FT01-04 — El programa puede cambiar mientras ya está ocurriendo

## Observación de campo

Durante la prueba, el director decidió cambiar una canción del programa.

La nueva canción:

- no estaba originalmente en la lista;
- podía no existir en la biblioteca de Aurelis;
- existía fuera de Aurelis en posesión de algún músico.

El grupo tuvo que salir de Aurelis para resolverlo.

## Problema

Un programa musical no siempre es definitivo.

La realidad puede cambiar durante:

- ensayo;
- soundcheck;
- presentación;
- servicio;
- concierto.

Aurelis no debe convertir una decisión musical espontánea en un proceso administrativo.

## Decisión de producto

Diseñar el concepto:

# Cambio rápido

Durante un programa activo, un usuario autorizado podrá incorporar rápidamente una canción.

### Caso A — Ya existe

Buscar en el repertorio disponible y agregarla.

### Caso B — No existe

Agregar inmediatamente un item mínimo mediante nombre.

No debe requerirse completar un formulario de canción antes de continuar.

Ejemplo:

> Cambio rápido

> Nombre: Sublime Gracia

> [Agregar al programa]

La estructuración completa puede realizarse posteriormente.

## Principio

> Resolver primero el momento musical.

> Completar la administración después.

## Prioridad propuesta

**Alta.**

---

# 7. Hallazgo FT01-05 — Compartir material durante un cambio inesperado

## Observación de campo

Cuando apareció una canción no preparada previamente, algún integrante podía disponer del material fuera de Aurelis.

Sin embargo, no existía una forma inmediata de incorporarlo y compartirlo con los demás dentro del programa activo.

## Decisión de producto

Permitir que un músico pueda aportar material a una canción incorporada durante el ensayo.

El flujo conceptual sería:

> Director agrega canción

↓

> Un músico tiene el material

↓

> Lo comparte con el programa activo

↓

> Los integrantes reciben el material

↓

> Continúa el ensayo

## Material potencial

Dependiendo del soporte definido:

- acordes/texto;
- material estructurado de Aurelis;
- imagen;
- PDF;
- otros formatos que Product y Engineering aprueben posteriormente.

No se debe convertir esta experiencia en un gestor genérico de archivos.

## Permisos conceptuales

**Director / líder / rol autorizado**

Puede modificar el programa activo.

**Músico**

Puede aportar/proponer material.

**Integrantes**

Reciben el cambio según disponibilidad y permisos.

El contrato exacto debe definirse antes de implementación.

## Conectividad

Si existe conexión:

> sincronización inmediata.

Si la conexión es inestable:

> guardar localmente + estado pendiente + reintento.

No se diseñará todavía sincronización peer-to-peer o cercana sin evidencia adicional.

## Prioridad propuesta

**Alta, posterior o integrada al diseño de Cambio rápido.**

---

# 8. Hallazgo FT01-06 — Motor musical para instrumentos armónicos

## Observación

Aurelis necesita completar la experiencia musical de instrumentos armónicos.

La transposición no puede limitarse únicamente a desplazar nombres de notas.

## Necesidad

Debe contemplarse correctamente la estructura musical de acordes y tonalidades.

Ejemplos:

- C
- Cm
- C7
- Cmaj7
- Cm7
- Cdim
- Caug
- Csus
- Cadd9
- inversiones/slash chords

Y relaciones musicales que puedan involucrar:

- tonalidades mayores;
- menores;
- acordes disminuidos;
- aumentados;
- extensiones;
- inversiones;
- escalas/modos cuando el producto lo requiera.

## Decisión de producto

Antes de ampliar la UI debe definirse un modelo musical formal.

Conceptualmente debe distinguir:

- nota raíz;
- alteración;
- calidad;
- extensiones;
- modificaciones;
- bajo/inversión;
- contexto tonal cuando corresponda.

No implementar esta capacidad mediante reemplazos simples de strings.

## Prioridad propuesta

**Alta para completar el núcleo musical.**

Requiere diseño de dominio antes de UI.

---

# 9. Hallazgo FT01-07 — El instrumento activo no limita la curiosidad musical

## Observación

Un músico puede tener asignado un instrumento y necesitar consultar material perteneciente a otro.

Ejemplo observado conceptualmente:

Un tecladista está ejecutando sus acordes.

Sin embargo, quiere consultar la melodía de trompetas para preparar una entrada desde teclado antes de que entren las trompetas.

## Problema

Ocultar todo material que no corresponde al instrumento activo limita situaciones musicales reales.

## Decisión de producto

Separar:

> Instrumento activo

de:

> Material que puedo consultar.

### Instrumento activo

Determina:

- material prioritario;
- transposición automática;
- vista inicial;
- asignación del músico.

### Consulta de otro material

Debe permitir abrir temporalmente material disponible para otros instrumentos sin cambiar la asignación ni el instrumento activo.

Ejemplo:

> Tu material

> ✓ Teclado — Acordes

> Material adicional

> Trompeta — Melodía disponible

Al consultar Trompeta:

- no cambia el instrumento activo;
- no modifica asignaciones;
- es una consulta contextual.

## Principio

> Aurelis prioriza lo que necesitas tocar.

> No limita lo que necesitas comprender.

## Prioridad propuesta

**Media-alta.**

---

# 10. Hallazgo FT01-08 — Catálogo y nomenclatura de instrumentos

## Decisión explícita de Product

Realizar los siguientes cambios:

### Eliminar

`Clarinete`

No debe aparecer como opción seleccionable en los flujos actuales definidos por Product.

### Renombrar

Usar:

`Flauta traversa`

de forma consistente.

No utilizar:

- Flauta;
- Flauta transversal;

cuando se refieran a esta opción específica del catálogo.

### Clasificación

`Flauta traversa` debe aparecer como instrumento independiente.

No debe quedar visualmente englobada bajo una opción genérica denominada `Concert`.

Esto aplica especialmente a los chips utilizados al crear una canción para seleccionar el instrumento fuente.

## Principio de dominio

La afinación o comportamiento de transposición de un instrumento no debe confundirse con su identidad dentro de la interfaz.

Varios instrumentos pueden compartir comportamiento de concert pitch internamente y seguir siendo instrumentos distintos para el músico.

## Engineering debe auditar antes de modificar

- tabla/catálogo `instruments`;
- `user_instruments`;
- `member_instruments`;
- canciones;
- versiones;
- materiales;
- asignaciones;
- valores históricos;
- migraciones necesarias.

No borrar registros históricos improvisadamente.

## Prioridad propuesta

**Refinamiento V1.**

---

# 11. Hallazgo FT01-09 — Próximos programas y memoria histórica

## Observación

Los programas cuya fecha ya pasó no deben continuar apareciendo dentro de la experiencia de próximos eventos.

## Decisión de producto

Separar explícitamente:

# Próximos

Contiene únicamente:

- programas del día actual;
- programas con fecha futura;
- casos sin fecha únicamente si Product define posteriormente su comportamiento.

Nunca debe seleccionar automáticamente un programa histórico como “próximo” sólo porque no existe uno futuro.

# Historial / Programas anteriores

En comunidades, cuando la fecha pasa, el programa se conserva como parte de la memoria de la comunidad.

Debe seguir siendo consultable.

Conceptualmente conserva:

- fecha;
- nombre;
- repertorio;
- orden;
- materiales;
- información histórica relevante.

La UI definitiva y el nombre final del apartado requieren Product Design.

## Principio

> Lo próximo sirve para prepararnos.

> El historial sirve para recordar.

No deben competir en la misma vista.

## Prioridad propuesta

**Alta / refinamiento de experiencia existente.**

---

# 12. Hallazgo FT01-10 — Programas personales y borrado lógico

## Decisión de producto

Los programas personales también deben respetar la separación temporal.

El usuario puede decidir eliminar un programa personal que ya no desea conservar.

La eliminación debe realizarse mediante borrado lógico.

Conceptualmente:

> programa

↓

> eliminar

↓

> `deleted_at`

↓

> deja de aparecer en la experiencia normal

No implementar eliminación física inmediata.

La existencia futura de:

- papelera;
- recuperación;
- retención temporal;

queda fuera del alcance hasta una decisión posterior.

## Prioridad propuesta

**Media.**

---

# 13. Mapa temporal descubierto

Los hallazgos permiten entender Aurelis en cuatro momentos.

## Antes

Aurelis ayuda a preparar.

- repertorio;
- programas;
- materiales;
- instrumentos;
- disponibilidad offline.

## Al llegar

Aurelis debe dar confianza.

- sesión accesible;
- programa descargado;
- última versión disponible;
- estado de sincronización comprensible.

## Durante

Aurelis debe desaparecer.

- modo ejecución;
- swipe entre canciones;
- cambios rápidos;
- material inmediato;
- consulta multiinstrumento.

## Después

Aurelis conserva memoria.

- programas anteriores;
- repertorio utilizado;
- historia de la comunidad;
- futuras experiencias de memoria musical.

Este modelo temporal debe considerarse en futuras decisiones de Product Design.

---

# 14. Clasificación preliminar

| Hallazgo                    | Tipo                  | Prioridad propuesta |
| --------------------------- | --------------------- | ------------------- |
| Offline musical             | Capacidad estructural | Crítica             |
| Acceso resiliente           | Confiabilidad         | Alta                |
| Modo Ensayo / Ejecución     | Nueva experiencia     | Alta                |
| Cambio rápido               | Nueva experiencia     | Alta                |
| Material compartido express | Colaboración          | Alta                |
| Motor armónico              | Núcleo musical        | Alta                |
| Consulta multiinstrumento   | Experiencia musical   | Media-alta          |
| Catálogo de instrumentos    | Refinamiento V1       | Media               |
| Próximos vs Historial       | Refinamiento V1       | Alta                |
| Borrado lógico personal     | Datos/experiencia     | Media               |

La prioridad es preliminar.

Engineering no debe interpretar esta tabla como orden automático de implementación.

---

# 15. Qué NO decidimos todavía

Esta prueba no define todavía:

- arquitectura offline final;
- límites exactos de almacenamiento;
- política automática de descargas;
- sincronización peer-to-peer;
- formato definitivo de archivos compartidos;
- UI final del modo ejecución;
- nombre definitivo de `Comenzar`, `Ensayo`, `En vivo` o equivalente;
- permisos definitivos de cambios express;
- modelo completo de conflictos de sincronización;
- historial visual definitivo;
- papelera o recuperación;
- todas las escalas/modos soportados por el motor musical.

Estas decisiones requieren diseño y/o auditoría técnica antes de implementación.

---

# 16. Instrucción para Engineering

Engineering debe utilizar este documento como evidencia de campo.

Antes de implementar:

1. auditar el estado actual del producto contra cada hallazgo;
2. identificar capacidades existentes que puedan reutilizarse;
3. detectar impactos en dominio, datos, RLS, sync y offline;
4. separar refinamientos seguros de cambios estructurales;
5. identificar ADR necesarios;
6. proponer fases de implementación;
7. presentar riesgos y criterios de aceptación;
8. no modificar producción sin las aprobaciones correspondientes.

No asumir que cada observación requiere una nueva funcionalidad.

No resolver problemas estructurales mediante parches locales.

---

# 17. Criterio rector

Toda solución derivada de esta prueba debe responder:

> ¿Reduce el tiempo, la incertidumbre o la carga mental del músico en un momento musical real?

Y especialmente:

> ¿Seguiría funcionando cuando el ensayo deja de seguir el plan?

Si la respuesta es no, la solución todavía no representa correctamente lo aprendido en campo.

---

# 18. Conclusión

La primera prueba real no invalidó la dirección de Aurelis.

La amplió.

Aurelis ya resuelve una parte importante de la preparación musical.

La prueba mostró que el siguiente desafío es acompañar la realidad después de preparar:

- cuando falla internet;
- cuando cambia el programa;
- cuando aparece una canción inesperada;
- cuando un músico necesita comprender otra parte;
- cuando ya no hay tiempo para administrar.

El producto debe evolucionar desde:

> Organizar antes de tocar.

hacia:

> **Preparar, acompañar y recordar la música sin ponerse en medio de ella.**

Ese aprendizaje constituye el principal resultado de Field Test 01.
