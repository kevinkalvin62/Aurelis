# Aurelis — technical backlog

Backlog de hallazgos; no implica que deban resolverse antes de Product Design salvo los críticos.

## Critical

- **C-01 Backend no reproducible:** recuperar/versionar esquema base, enums, RLS, funciones, seeds y tipos Supabase.
- **C-02 Seguridad no auditable extremo a extremo:** probar RLS/RPC por rol y documentar ownership de producción.
- **C-03 Estrategia de datos sin garantía de conflicto/pérdida:** definir contrato offline/sync y recuperación antes de ampliar colaboración.

## High

- **H-01** Separar orquestación de pantallas monolíticas para habilitar Product Design y pruebas.
- **H-02** Añadir CI con typecheck, lint, unit tests, export y migraciones.
- **H-03** Configurar ESLint y política de formatting/imports.
- **H-04** Cubrir E2E: invitado, auth, canción, transporte, setlist, organización y permisos.
- **H-05** Completar configuración de release iOS/Android, entornos y evidencia de builds.
- **H-06** Diseñar estado de error/reintento visible para consultas y sincronización.
- **H-07** Definir ownership Zustand/TanStack Query y evitar doble fuente de verdad.
- **H-08** Hacer atómicas las operaciones multi-paso sensibles o formalizar compensación server-side.
- **H-09** Auditar accesibilidad (screen reader, teclado, contraste, touch targets, Dynamic Type).
- **H-10** Decidir alcance real de comunidad y privacidad antes de exponer contenido público.

## Medium

- **M-01** Formalizar design tokens y variantes UI.
- **M-02** Inventariar/extraer headers, fields, states, chips y cards repetidos.
- **M-03** Unificar estrategia de formularios y validación.
- **M-04** Generar tipos de DB y retirar `any` de mappers.
- **M-05** Instrumentar crash reporting, logs y métricas de sync.
- **M-06** Definir historial/restauración de versiones de canciones.
- **M-07** Resolver favoritos: acción, persistencia y semántica.
- **M-08** Completar edición/eliminación de setlists y organizaciones.
- **M-09** Implementar invitaciones reales en lugar de alta directa por correo.
- **M-10** Probar componentes, servicios Supabase y comportamiento por plataforma.
- **M-11** Revisar React Compiler experimental y compatibilidad de librerías.
- **M-12** Versionar y probar deep links de recuperación.

## Low

- **L-01** Auditar/eliminar dependencias sin uso demostrado.
- **L-02** Corregir documentación de README y codificación visible en algunas salidas de terminal.
- **L-03** Sustituir glifos improvisados de tabs por iconos consistentes.
- **L-04** Añadir Storybook/catálogo visual si Product Design lo necesita.
- **L-05** Estandarizar mensajes, capitalización y términos canción/programa/setlist.
- **L-06** Documentar presupuestos de performance y bundle.
- **L-07** Automatizar el archivo visual y baseline de regresión.

