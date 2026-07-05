# Aurelis V1 — Mejoras futuras

Fecha: 5 de julio de 2026  
Fuente: Auditoría de experiencia V2 y `engineering-discoveries.md`

Esta lista no autoriza implementación. Ordena trabajo posterior sin mezclarlo con
el refinamiento de V1.

## Requieren decisión de Product

1. Definir saludo neutral o franjas horarias locales para evitar que Home diga
   siempre “Buenas tardes”. Prioridad baja.
2. Decidir si Home debe mostrar un estado sin próximo programa en lugar de usar
   el programa histórico más reciente. Prioridad media.
3. Establecer un contrato confiable de hora de evento antes de adaptar el CTA
   dentro del mismo día. Prioridad media.
4. Definir acción, persistencia y significado de Favoritas antes de ampliar ese
   filtro. Prioridad baja.

## Validación pendiente de entorno

1. Ejecutar smoke test visual en iOS y Android con listas cortas y largas,
   teclado, safe areas y tamaños de accesibilidad.
2. Verificar selector de programa local, organización con permisos, rol sin
   permisos y canción remota no sincronizada.
3. Repetir Expo Doctor con conectividad autorizada hasta obtener 21/21.

## Criterio para incorporarlas

Cada mejora debe demostrar reducción de tiempo, incertidumbre o carga mental y
recibir la aprobación correspondiente antes de entrar a implementación. Ninguna
de ellas bloquea el refinamiento entregado.
