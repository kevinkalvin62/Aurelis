# Aurelis — Music Domain
## Simple Musical Model

**Versión:** 1.0  
**Estado:** Fundacional  
**Categoría:** Foundation / Music Domain

---

# 1. Propósito

Este documento define cómo Aurelis entiende una canción desde el punto de vista musical.

No define:

- la base de datos;
- la interfaz;
- la implementación técnica;
- el algoritmo de transposición.

Su propósito es establecer el modelo conceptual que permitirá que Aurelis evolucione sin perder simplicidad para el músico.

---

# 2. Filosofía

Una aplicación puede tener un modelo interno muy poderoso.

Eso no significa que el usuario deba verlo.

En Aurelis buscamos exactamente lo contrario.

Mientras el motor musical comprende la complejidad de una interpretación, el músico debe sentir que simplemente está escribiendo su material.

El sistema debe adaptarse a la manera en que los músicos trabajan.

No pedir que los músicos aprendan cómo piensa el sistema.

---

# 3. Principio rector

> **La complejidad musical pertenece al motor de Aurelis, no al formulario que llena el músico.**

Si una nueva capacidad requiere explicar teoría musical para utilizarla, probablemente el diseño todavía no es correcto.

---

# 4. ¿Qué es una canción?

Para Aurelis, una canción no es un archivo.

Tampoco es un PDF.

Ni una imagen.

Una canción representa una interpretación musical que puede contener distintos momentos durante su ejecución.

Cada uno de esos momentos puede compartir o modificar determinados elementos musicales sin dejar de pertenecer a la misma canción.

---

# 5. Tonalidad inicial

Toda canción posee una tonalidad inicial.

Esta representa el punto desde el cual comienza la interpretación.

Ejemplo:

Nombre

Yo Haré Una Fiesta

Tonalidad inicial

Em

Esta tonalidad será utilizada por el motor de transposición como referencia principal.

---

# 6. Cambios de tonalidad

No todas las canciones permanecen en la misma tonalidad.

Muchas interpretaciones realizan una subida o bajada de tono durante la ejecución.

Ejemplo:

Em

↓

Gm

Para el músico esto normalmente se expresa de manera muy simple.

> "Aquí sube de tono."

Aurelis debe respetar esa forma natural de pensar.

---

# 7. Experiencia del usuario

Por defecto, crear una canción sigue siendo un proceso simple.

El músico registra:

- nombre;
- tonalidad inicial;
- instrumento fuente;
- material musical.

Nada más.

No existen secciones obligatorias.

No existen estructuras musicales obligatorias.

No existen formularios complejos.

---

# 8. Cambios de tono opcionales

Cuando una canción cambia de tonalidad, el músico puede indicarlo mediante una acción específica.

Ejemplo:

+ La canción cambia de tono

o

+ Agregar subida de tono

Al seleccionarla únicamente deberá indicar:

Nueva tonalidad

Gm

y el punto donde comienza ese cambio.

No será necesario definir:

- intro;
- verso;
- coro;
- puente;
- final.

El músico simplemente identifica el lugar donde ocurre el cambio.

---

# 9. Material musical

El contenido escrito por el músico continúa siendo libre.

Puede incluir:

- notas;
- acordes;
- indicaciones;
- texto;
- títulos;
- comentarios.

Ejemplo:

Intro

F# G# A B C#

Línea principal

F# G# A G#

Subida

A B C

Para Aurelis esos títulos representan únicamente texto escrito por el usuario.

No son entidades obligatorias del sistema.

---

# 10. Responsabilidad del motor musical

Una vez registrado un cambio de tonalidad, el músico no debería preocuparse por realizar ajustes adicionales.

El motor musical deberá:

- identificar cuándo inicia cada tonalidad;
- aplicar la transposición correspondiente;
- mantener la relación correcta entre las distintas tonalidades;
- presentar siempre el material correcto para el instrumento seleccionado.

Todo este proceso pertenece al motor interno.

No al usuario.

---

# 11. Instrumento fuente

Toda canción continúa teniendo un instrumento fuente.

Ese instrumento representa el material original con el que fue registrada.

La existencia de cambios de tonalidad no modifica este principio.

---

# 12. Escalabilidad

Aunque la experiencia permanezca sencilla, el modelo debe permitir crecer en el futuro.

Sin modificar la forma en que el músico crea una canción, Aurelis podrá evolucionar para soportar:

- múltiples cambios de tonalidad;
- bajadas de tono;
- medleys;
- versiones alternativas;
- interpretaciones especiales;
- adaptaciones por comunidad;
- futuras capacidades musicales.

La interfaz no debe anticipar complejidad que el usuario todavía no necesita.

---

# 13. Lo que NO queremos

No queremos que Aurelis obligue al músico a construir una estructura formal de la canción.

No queremos formularios donde sea obligatorio definir:

- Intro
- Verso
- Coro
- Puente
- Solo
- Final

Esos elementos pueden existir dentro del contenido escrito por el músico si él así lo desea.

No forman parte obligatoria del proceso de creación.

---

# 14. Principio de simplicidad progresiva

Las funciones avanzadas aparecen únicamente cuando son necesarias.

Una canción que nunca cambia de tonalidad nunca mostrará opciones relacionadas con cambios de tono.

El músico que únicamente necesita escribir sus notas debe poder hacerlo sin descubrir complejidad innecesaria.

---

# 15. Criterio de diseño

Cada nueva capacidad relacionada con el dominio musical deberá responder una pregunta antes de ser aprobada.

> ¿Esta función ayuda al músico sin obligarlo a aprender cómo funciona el sistema?

Si la respuesta es negativa, el diseño debe reconsiderarse.

---

# 16. Conclusión

Aurelis no busca representar toda la teoría musical dentro de un formulario.

Busca comprenderla internamente para que el músico no tenga que pensar en ella.

El objetivo no es construir el editor más complejo.

El objetivo es construir la herramienta más natural para quien ya sabe hacer música.

La potencia del sistema debe crecer.

La experiencia del músico debe permanecer igual de simple.

Porque en Aurelis creemos que:

> **La mejor tecnología musical es aquella que desaparece mientras la música continúa.**