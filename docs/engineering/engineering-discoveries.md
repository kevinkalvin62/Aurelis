# Engineering Discoveries — Aurelis V1 Refinement

Este documento registra hallazgos observados durante el refinamiento. No autoriza
su implementación dentro de la misión actual.

## ED-001 — El saludo no considera la hora real

Problema

Home muestra siempre “Buenas tardes”, incluso por la mañana o noche.

Impacto

La conversación inicial puede sentirse mecánica o fuera de contexto.

Posible solución

Definir con Product una regla de saludo por horario local o usar un saludo
neutral.

Necesita Product: Sí

Prioridad: Baja

## ED-002 — Un programa histórico puede aparecer como próximo

Problema

Cuando no existen programas futuros ni sin fecha, `selectNextSetlist` devuelve el
programa histórico más reciente.

Impacto

La card principal puede presentar un evento pasado como contexto actual.

Posible solución

Definir un estado de Home sin programa próximo y separar explícitamente historial
de preparación futura.

Necesita Product: Sí

Prioridad: Media

## ED-003 — La fecha del programa no incluye contexto horario confiable

Problema

El dominio técnico contiene `time`, pero los flujos persistidos no garantizan una
hora de evento utilizable de forma consistente.

Impacto

No es seguro cambiar el CTA dentro del mismo día según “antes/durante/después”.

Posible solución

Revisar con Product el contrato temporal del programa antes de introducir reglas
por hora.

Necesita Product: Sí

Prioridad: Media

## ED-004 — Favoritos aparece como filtro sin contrato completo

Problema

Biblioteca expone el filtro “Favoritas”, pero el backlog previo reconoce que la
acción, persistencia y semántica de favoritos no están resueltas completamente.

Impacto

El filtro puede permanecer vacío o generar una expectativa que el producto no
explica.

Posible solución

Product debe decidir el significado y alcance de favoritos antes de ampliar su
presencia.

Necesita Product: Sí

Prioridad: Baja
