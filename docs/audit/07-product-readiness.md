# Aurelis — Product Readiness frente a Foundation v1.0

## Conclusión

**Alineación estimada: media-alta en intención y media-alta en el happy path autenticado; media en resiliencia.** El producto actual entiende bien el propósito —menos organización, más música— y demuestra con datos reales repertorio, transporte, preparación y colaboración dentro de una organización. Aún no cumple plenamente la promesa de confianza, continuidad e invisibilidad porque errores, offline, sincronización y memoria histórica permanecen parciales.

## Alineación con la visión

| Principio Foundation | Evidencia actual | Evaluación |
|---|---|---|
| Música como protagonista | visor limpio, presentación, transposición y acceso rápido | Alta |
| Menor carga organizativa | biblioteca, búsqueda, parser de mensajes y setlists | Alta |
| Calma y claridad | lenguaje visual coherente, jerarquía fuerte, estados vacíos accionables | Media-alta |
| Continuidad | scopes locales y sync de canciones | Media; organizaciones dependen de red y sync es parcial |
| Confianza | validación, toasts y rollback parcial | Media-baja; algunos errores se silencian o parecen vacíos |
| Comunidad | organización real con propietario, músico, instrumentos, repertorio y programas | Media-alta en colaboración privada; no existe comunidad pública ni invitaciones completas |
| Memoria musical | versiones y setlists conservan parte del historial | Baja-media; no hay UI de historia, comparación o restauración |
| Tecnología invisible | flujo invitado simple y UI sobria | Media; loaders/errores y complejidad operativa aún emergen |

## Preparación por dimensión

- **Propuesta de valor:** validada técnicamente y mediante un recorrido autenticado con repertorio y colaboración reales.
- **Arquitectura de información:** suficiente para explorar Product Design, no congelada para crecimiento.
- **Sistema visual:** consistente como dirección, todavía no es un design system.
- **Datos y permisos:** funcionales en producción existente, no reproducibles/auditables desde Git.
- **Calidad:** buen núcleo unitario; insuficiente para release público.
- **Operación:** no preparada (sin observabilidad/CI/evidencia de stores).
- **Contenido/marketing:** ya existe marca y archivo inicial, pero faltan casos reales, legal y narrativa de comunidad/historia.

## Decisiones necesarias antes de nueva implementación

1. Definir el producto primario: músico individual, equipo/organización o ambos con una secuencia clara.
2. Acordar vocabulario: programa, setlist, servicio, organización y comunidad.
3. Delimitar “comunidad”: colaboración privada, descubrimiento público, social o marketplace.
4. Definir fuente de verdad y promesa offline para cada entidad.
5. Fijar permisos, privacidad, propiedad del repertorio y salida de una organización.
6. Decidir qué constituye la “memoria musical”: versiones, interpretaciones, arreglos, autores y auditoría.
7. Priorizar flujos críticos de Product Design y sus estados vacíos/carga/error/offline.
8. Elegir estrategia de monorepo/landing sin acoplar la arquitectura móvil al marketing.
9. Establecer criterios de release: accesibilidad, seguridad, E2E, observabilidad y soporte.
10. Recuperar el contrato completo de Supabase antes de cambiar modelos.

## Recomendación de entrada a Product Design

Usar el corte actual como prototipo funcional y fuente de restricciones, no como especificación final. Empezar por tres journeys: preparar repertorio personal, preparar/tocar un setlist y colaborar dentro de una organización. Para cada journey diseñar happy path, offline, permisos, vacío, carga, error y recuperación. El archivo visual de esta auditoría sirve como baseline “before”, no como aprobación del diseño actual.

## Gate sugerido para volver a desarrollar

Product Design puede comenzar ya. La implementación siguiente debería esperar a que estén decididos: journeys prioritarios, modelo de comunidad, contrato de datos/permisos, estrategia offline y arquitectura de repositorio. En paralelo, los Critical del backlog deben quedar resueltos o explícitamente aceptados como riesgo.
