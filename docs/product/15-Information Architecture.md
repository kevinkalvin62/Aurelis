# Aurelis — Information Architecture

Versión: 1.0

Estado: Congelado

---

# Introducción

Aurelis organiza información.

No únicamente pantallas.

Cada entidad del sistema representa conocimiento que deberá existir en un único lugar.

Nuestro objetivo consiste en construir una arquitectura donde la información sea fácil de encontrar, sencilla de comprender y consistente para todos los músicos.

Una buena arquitectura reduce duplicidad.

Reduce incertidumbre.

Reduce errores.

Y permite que el producto evolucione durante muchos años.

---

# Filosofía

Toda pieza de información deberá tener un único lugar donde vivir.

El resto del sistema únicamente deberá referenciarla.

Nunca duplicarla.

La arquitectura existe para proteger la consistencia del producto.

---

# Principios

## Una responsabilidad por entidad

Cada entidad deberá representar un único concepto del dominio.

---

## Una fuente de verdad

La información oficial solamente existirá una vez.

---

## Referenciar antes que copiar

Siempre que sea posible, compartiremos referencias.

No duplicaremos información.

---

## El contexto pertenece al contexto

Las notas personales pertenecen al músico.

No a la canción.

Las anotaciones del director pertenecen al programa.

No a la biblioteca.

---

## El conocimiento evoluciona

La arquitectura deberá permitir cambios sin romper la consistencia del producto.

---

# Capas del conocimiento

## Identidad

Personas.

Perfiles.

Instrumentos.

Preferencias.

---

## Comunidad

Organizaciones.

Miembros.

Roles.

Invitaciones.

---

## Conocimiento musical

Bibliotecas.

Canciones.

Versiones.

Recursos.

Instrumentos.

Transportaciones.

---

## Organización musical

Programas.

Eventos.

Ensayos.

Setlists.

Orden.

Notas.

---

## Colaboración

Invitaciones.

Asignaciones.

Comentarios futuros.

Historial.

---

# Flujo del conocimiento

Persona

↓

Organización

↓

Biblioteca

↓

Canción

↓

Versión

↓

Programa

↓

Setlist

↓

Instrumento

↓

Músico

↓

Ensayo

---

# Reglas de arquitectura

...