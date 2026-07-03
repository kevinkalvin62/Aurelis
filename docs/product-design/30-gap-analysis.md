# Aurelis — Gap Analysis

**Versión:** 1.0  
**Estado:** En desarrollo  
**Documento relacionado:** Foundation v1.0 · Product Design · Project Audit  
**Fuente:** Auditoría Codex · 3 de julio de 2026

---

# 1. Introducción

Este documento compara la visión definida en Foundation v1.0 y Product Design contra el estado real del código actual de Aurelis.

Su objetivo no es criticar el MVP existente.

Su objetivo es convertirlo en un punto de partida claro para la siguiente etapa de desarrollo.

La aplicación actual será tratada como:

- prototipo funcional auditado;
- baseline visual;
- fuente de aprendizaje;
- punto de comparación.

No será descartada.

No será asumida como arquitectura final.

Será evaluada con criterio.

---

# 2. Dictamen General

Codex concluyó que Aurelis se encuentra en estado:

> **MVP funcional, previo a producción.**

Esto significa que el producto actual ya demuestra valor real, pero todavía no está preparado para representar por completo la visión documentada.

Aurelis actual funciona como prototipo.

Aurelis Foundation define el producto que queremos construir.

Este Gap Analysis define el puente entre ambos.

---

# 3. Estado Actual vs Visión

| Área | Estado actual | Visión Aurelis | Acción |
|---|---|---|---|
| Motor musical | Funcional y probado | Núcleo confiable del producto | Mantener y fortalecer |
| Transposición | Funcional | Adaptar música a cada músico | Mantener |
| Biblioteca personal | Funcional | Forever Personal útil | Mantener y mejorar UX |
| Setlists/programas | Funcional parcial | Preparar ensayos sin fricción | Rediseñar experiencia |
| Organizaciones | Funcional parcial | Comunidad estructurada | Rediseñar modelo |
| Comunidad | No existe como experiencia completa | Colaboración organizada | Diseñar desde Product Design |
| Supabase | Funcional pero no reproducible | Backend confiable y auditable | Corregir antes de escalar |
| Offline/sync | Parcial | Confianza y continuidad | Rediseñar contrato |
| UI | Visualmente consistente | Experience System completo | Formalizar Design System |
| Pantallas | Monolíticas | Flujos claros por momento | Refactor guiado por journeys |
| Testing | Unitario sano | Calidad release-ready | Ampliar pirámide |
| Release | Parcial | Publicación confiable | Completar pipeline |

---

# 4. Qué Mantener

Estas partes representan valor real y no deberán descartarse sin justificación.

## Motor Musical

El motor musical actual es una de las mayores fortalezas del proyecto.

Incluye:

- notación;
- transposición;
- instrumentos;
- parser;
- lógica musical probada.

**Decisión:** mantenerlo como base del dominio musical.

---

## Identidad Visual Inicial

La app ya posee una dirección visual coherente con Aurelis.

**Decisión:** usarla como baseline visual, no como Design System final.

---

## Flujo Invitado

El modo invitado permite experimentar Aurelis sin fricción.

**Decisión:** mantenerlo como parte del modelo Forever Personal.

---

## Biblioteca Personal

La biblioteca personal ya demuestra valor individual.

**Decisión:** mantenerla y alinearla al concepto de conocimiento musical.

---

## Setlists / Programas

El MVP actual demuestra el valor de preparar repertorios.

**Decisión:** conservar el aprendizaje, pero rediseñar la experiencia con base en Product Design.

---

## Organizaciones

El concepto existe y funciona parcialmente.

**Decisión:** mantenerlo como base, pero rediseñar la experiencia de comunidad.

---

# 5. Qué Mejorar

Estas áreas son valiosas, pero todavía no cumplen completamente la visión.

## Pantallas Monolíticas

Varias pantallas mezclan lógica, render, permisos, fetch y mutaciones.

**Acción:** separar en hooks, componentes y view-models después de definir flows.

---

## Estados del Sistema

Faltan estados consistentes de:

- vacío;
- carga;
- error;
- éxito;
- offline;
- reintento.

**Acción:** diseñarlos desde `27-empty-states.md` y Experience System.

---

## Formularios

Existen múltiples estrategias de formularios.

**Acción:** unificar validación, mensajes y UX.

---

## Componentes Repetidos

Hay patrones repetidos:

- headers;
- cards;
- chips;
- inputs;
- empty states;
- loaders.

**Acción:** formalizar en `25-experience-design-system.md`.

---

## Accesibilidad

No existe una política sistemática de accesibilidad.

**Acción:** incluir accesibilidad como requisito de Product Readiness.

---

# 6. Qué Rediseñar

Estas áreas no deben escalarse tal como están.

## Supabase

El backend no es completamente reproducible desde Git.

**Acción crítica:** recuperar/versionar esquema base, RLS, RPC, enums, seeds y tipos generados.

---

## Offline / Sync

La estrategia actual no garantiza conflicto, recuperación ni continuidad.

**Acción crítica:** definir contrato offline/sync antes de ampliar colaboración.

---

## Comunidad

Actualmente existe organización privada, pero no una experiencia completa de comunidad.

**Acción:** diseñar modelo final de comunidad, roles, permisos, invitaciones y propiedad del conocimiento.

---

## Invitaciones

Hoy la experiencia no representa todavía la visión de integración natural.

**Acción:** rediseñar como journey: “un músico nuevo llega preparado al siguiente ensayo”.

---

## Permisos y Roles

Existen bases, pero falta claridad de producto.

**Acción:** definir desde Domain Model y Community Experience.

---

# 7. Riesgos Críticos

Antes de escalar desarrollo, estos puntos deben resolverse o aceptarse explícitamente como riesgo.

## C-01 Backend no reproducible

Aurelis no puede depender de un Supabase que solo existe en producción.

**Decisión requerida:** crear contrato reproducible del backend.

---

## C-02 Seguridad no auditable

RLS/RPC deben poder probarse por rol.

**Decisión requerida:** crear pruebas y documentación de seguridad.

---

## C-03 Sync parcial

La promesa de confianza requiere continuidad.

**Decisión requerida:** definir qué entidades son local-first, remote-first o híbridas.

---

# 8. Prioridades de Implementación

## Fase 1 — Stabilize

Objetivo: hacer confiable el estado actual.

Incluye:

- esquema Supabase reproducible;
- tipos generados;
- ESLint;
- CI básico;
- tests existentes en pipeline;
- auditoría de dependencias.

---

## Fase 2 — Align

Objetivo: alinear app actual con Foundation.

Incluye:

- vocabulario oficial;
- estados vacíos/carga/error;
- copywriting;
- tokens visuales;
- componentes base.

---

## Fase 3 — Redesign Critical Journeys

Objetivo: rediseñar los recorridos principales.

Journeys prioritarios:

1. Preparar repertorio personal.
2. Preparar/tocar un programa.
3. Colaborar dentro de una comunidad.
4. Incorporar un nuevo músico.
5. Recuperar repertorio anterior.

---

## Fase 4 — Monorepo

Objetivo: reorganizar el proyecto sin rediseñar al mismo tiempo.

Regla:

> Migración mecánica primero. Rediseño después.

---

## Fase 5 — Release Readiness

Objetivo: preparar Aurelis para músicos reales.

Incluye:

- E2E;
- accesibilidad;
- observabilidad;
- builds;
- privacy;
- terms;
- landing;
- Google Play.

---

# 9. Decisiones para Codex

Codex no debe empezar desarrollando nuevas funcionalidades.

Primero deberá trabajar en este orden:

1. Congelar baseline técnico.
2. Recuperar Supabase reproducible.
3. Generar tipos Supabase.
4. Configurar ESLint/CI.
5. Separar pantallas grandes solo donde Product Design ya lo justifique.
6. Preparar monorepo con migración mecánica.
7. No rediseñar experiencia sin documento Product Design asociado.

---

# 10. Prompt Base para Codex

```text
Actúa como Staff Engineer y Product-Oriented Architect para Aurelis.

Ya existe Foundation v1.0, Product Design inicial y una auditoría completa del estado actual.

Tu trabajo no es improvisar nuevas funcionalidades.

Tu trabajo es cerrar la brecha entre la visión documentada y el estado real del código.

Antes de modificar código, lee:

- docs/foundation/
- docs/product-design/
- docs/audit/
- docs/product-design/30-gap-analysis.md

Reglas:

1. No agregues funcionalidades no documentadas.
2. No cambies vocabulario del dominio sin actualizar 16-domain-model.md.
3. No rediseñes pantallas sin una experiencia documentada.
4. No escales colaboración hasta resolver Supabase reproducible y sync.
5. Mantén el motor musical actual salvo evidencia fuerte.
6. Toda mejora debe indicar qué gap resuelve.
7. Cada cambio debe poder rastrearse a Foundation, Product Design o Technical Backlog.

Primera misión:

Preparar la base técnica para que Aurelis pueda evolucionar hacia la visión documentada sin perder estabilidad.

Entregables iniciales:

- Supabase reproducible.
- Tipos generados.
- CI básico.
- ESLint.
- Reporte de dependencias.
- Plan de refactor por journeys.