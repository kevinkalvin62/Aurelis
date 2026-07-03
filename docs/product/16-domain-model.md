# Aurelis — Domain Model

**Versión:** 1.0

**Estado:** Congelado

**Documento relacionado:**

- Information Architecture
- Product Principles
- Product Lifecycle

---

# Introducción

Antes de construir software debemos construir un lenguaje común.

Aurelis no está compuesto únicamente por pantallas, tablas o APIs.

Está compuesto por conceptos del mundo real relacionados con la organización musical.

Este documento define el significado oficial de esos conceptos.

Su objetivo consiste en garantizar que todas las personas involucradas en Aurelis —desarrollo, diseño, producto, soporte, documentación y contenido— hablen exactamente el mismo idioma.

Mientras Aurelis exista, este será el vocabulario oficial del producto.

Porque creemos que un lenguaje claro produce mejores decisiones.

Y mejores decisiones producen mejores productos.

---

# Filosofía del Dominio

El dominio representa el conocimiento del negocio.

No pertenece a una tecnología.

No pertenece a una base de datos.

No pertenece a un framework.

Representa la forma en que Aurelis entiende el mundo musical.

## Principios Fundamentales

### Un concepto representa una única idea.

Cada concepto deberá tener una sola responsabilidad.

Nunca utilizaremos un mismo concepto para representar dos ideas distintas.

---

### El dominio nunca depende de la tecnología.

React Native cambiará.

Supabase cambiará.

Las APIs cambiarán.

El dominio permanecerá.

La tecnología deberá adaptarse al dominio.

Nunca al contrario.

---

### El lenguaje protege al producto.

Las palabras generan decisiones.

Las decisiones generan arquitectura.

La arquitectura genera software.

Si el lenguaje es ambiguo, el producto también lo será.

---

### Toda conversación comienza aquí.

Antes de discutir funcionalidades.

Antes de diseñar pantallas.

Antes de escribir código.

Primero debemos entender el dominio.




# Nombre del Concepto

## Definición

¿Qué representa dentro del universo Aurelis?

---

## Propósito

¿Por qué existe?

¿Qué problema resuelve?

---

## Vive en

¿A qué dominio pertenece?

---

## Contiene

¿Qué información representa?

---

## Nunca representa

¿Qué NO significa?

¿Qué suele confundirse con este concepto?

---

## Relaciones

¿Con qué otros conceptos interactúa?

---

## Principios relacionados

¿Qué Product Principles protege?

---

## Ejemplo real

Un ejemplo cotidiano que explique el concepto.


Persona

Perfil

Organización

Miembro

Rol

Biblioteca

Canción

Versión

Material de Apoyo

Instrumento

Programa

Setlist

Evento

Ensayo

Nota

Invitación

Permiso

Comunidad



Persona

↓

tiene

↓

Perfil

↓

puede pertenecer a

↓

Organización

↓

contiene

↓

Biblioteca

↓

contiene

↓

Canciones

↓

poseen

↓

Versiones

↓

incluyen

↓

Materiales de apoyo

↓

son utilizadas por

↓

Programas

↓

organizan

↓

Setlists

↓

son interpretados por

↓

Músicos

↓

durante

↓

Ensayos / Eventos


Las relaciones representan cómo fluye el conocimiento.

No cómo se almacena.

Toda nueva relación deberá fortalecer la comprensión del dominio.

Nunca complicarla.



# Reglas del Lenguaje

## Regla 1

Un concepto representa una única responsabilidad.

---

## Regla 2

Nunca existirán dos conceptos con el mismo significado.

---

## Regla 3

Todo nuevo concepto deberá existir primero en este documento.

Después podrá implementarse en:

- UX
- Código
- API
- Base de Datos
- Documentación

Nunca al revés.

---

## Regla 4

El lenguaje del negocio tiene prioridad sobre el lenguaje técnico.

La documentación nunca utilizará conceptos propios de la implementación como:

- Entity
- DTO
- Repository
- Collection
- Row
- Table

---

## Regla 5

Antes de crear un nuevo concepto responderemos:

¿Qué problema representa?

¿Qué responsabilidad tiene?

¿Dónde vive?

¿Con qué otros conceptos se relaciona?

¿Existe ya un concepto equivalente?

---

## Regla 6

El mismo concepto deberá llamarse igual en:

- Documentación
- UX
- Código
- APIs
- Contenido
- Soporte

La coherencia del lenguaje protege la coherencia del producto.





