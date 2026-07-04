# Aurelis — Experience Design System

**Versión:** 1.0  
**Estado:** En desarrollo  
**Documento relacionado:** Foundation · Experience System · Experience Wireframes

---

# 1. Introducción

El Design System de Aurelis no existe para crear una interfaz bonita.

Existe para hacer que cada parte del producto se sienta coherente, tranquila y confiable.

Cada componente, color, espacio, estado y patrón visual deberá ayudar al músico a concentrarse en la música.

No construiremos componentes por estética.

Construiremos componentes para reducir fricción.

---

# 2. Filosofía

Aurelis debe sentirse como un compañero silencioso.

Organizado.

Claro.

Discreto.

Confiable.

El sistema visual deberá acompañar sin competir con la música.

Por eso, cada decisión visual deberá responder:

> ¿Esto ayuda al músico a entender mejor, actuar más rápido o sentirse más tranquilo?

Si la respuesta es no, probablemente no pertenece al sistema.

---

# 3. Principios del sistema

## Claridad antes que decoración

La interfaz debe explicar sin saturar.

Nada debe estar presente únicamente porque “se ve bien”.

---

## Consistencia antes que creatividad aislada

Una pantalla no debe sentirse distinta solo por intentar destacar.

Aurelis debe sentirse familiar en todo momento.

---

## Jerarquía antes que cantidad

El músico debe entender inmediatamente qué es importante.

La información secundaria debe acompañar, no competir.

---

## Estados visibles y humanos

Cargando, vacío, error, éxito y offline son parte de la experiencia.

No son detalles técnicos.

---

## Componentes con propósito

Cada componente deberá existir porque resuelve una necesidad repetida.

No porque anticipamos que “tal vez se use”.

---

# 4. Componentes base

El sistema deberá definir como mínimo:

- Button
- Text Field
- Text Area
- Select
- Date Field
- Card
- Song Row
- Program Row
- Community Card
- Empty State
- Loading State
- Error State
- Toast
- Modal Header
- Chip
- Instrument Badge
- Section Header

Cada componente deberá documentar:

- propósito;
- variantes;
- cuándo usarlo;
- cuándo no usarlo;
- estados;
- accesibilidad;
- ejemplo de uso.

---

# 5. Tokens visuales

Los tokens oficiales deberán incluir:

- colores;
- tipografía;
- espaciado;
- radios;
- sombras;
- bordes;
- tamaños táctiles;
- duración de animaciones.

Los tokens no son decoración.

Son decisiones repetibles.

---

# 6. Estados del sistema

Aurelis deberá tener estados consistentes para:

## Vacío

Debe acompañar e invitar a comenzar.

Ejemplo:

> Aquí comenzará el repertorio de tu agrupación.

---

## Carga

Debe transmitir calma.

No incertidumbre.

---

## Error

Debe explicar qué ocurrió y qué puede hacer el músico.

Nunca mostrar errores técnicos sin contexto.

---

## Éxito

Debe confirmar sin interrumpir.

---

## Offline

Debe comunicar seguridad.

Ejemplo:

> Tus cambios están guardados en este dispositivo. Los sincronizaremos cuando vuelva la conexión.

---

# 7. Accesibilidad

El Design System deberá considerar desde el inicio:

- contraste;
- tamaños táctiles;
- labels accesibles;
- navegación por teclado cuando aplique;
- soporte para lectores de pantalla;
- estados de foco;
- claridad de mensajes.

La accesibilidad no será una mejora futura.

Será parte de la calidad base.

---

# 8. Relación con Engineering

Engineering no deberá crear componentes aislados sin revisar este documento.

Si una pantalla necesita un nuevo patrón visual, primero deberá definirse aquí.

Después podrá implementarse.

El orden correcto será:

```text
Experience Wireframe
↓
Experience Design System
↓
Implementation