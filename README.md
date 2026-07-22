# SAMA Mobile

**Alertas de riesgo hidrometeorológico para el territorio antioqueño, directo al bolsillo de cada ciudadano.**

## Qué es esto

Propuesta y desarrollo de un MVP de aplicación móvil (Android/iOS) para el **SAMA — Sistema de Alerta y Monitoreo de Antioquia**, preparada para el **Dagran** (Departamento Administrativo de Gestión del Riesgo de Desastres de Antioquia).

El SAMA ya instrumenta más de 36 municipios con estaciones meteorológicas, pluviómetros, sensores de nivel y cámaras, y ya genera miles de alertas al año — pero su único canal público es un geoportal web que exige que el ciudadano entre a consultar. En una creciente súbita nocturna, nadie está mirando un portal. Esta app cierra esa brecha: lleva la alerta al celular del ciudadano, con georreferenciación por municipio/cuenca, el estado de las estaciones en un mapa, y recomendaciones claras de qué hacer antes, durante y después de una emergencia.

La propuesta completa (contexto, alcance, arquitectura, cronograma) está en [`docs/proposal/mvp-proposal.md`](docs/proposal/mvp-proposal.md); el backlog de 48 tickets en [`docs/proposal/backlog.md`](docs/proposal/backlog.md).

## Sobre este proyecto

Propuesta técnica y de producto, arquitectura y backlog diseñados por **Sergio Monsalve**. El desarrollo del MVP sigue una disciplina de *spec-driven development* asistido por agentes de IA: cada cambio parte de una spec versionada con criterios de aceptación, pasa por un plan aprobado antes de tocar código, se entrega en incrementos pequeños y se verifica de verdad (no solo "compila"). Ver [`docs/specs/`](docs/specs/) para la spec del ciclo en curso.

## Alcance del MVP

- **Alertas push georreferenciadas** por municipio/cuenca, con niveles verde/amarilla/naranja/roja.
- **Mapa de estaciones en tiempo real** (pluviómetros, sensores de nivel, cámaras) con tendencia 24–72h.
- **"¿Qué hago?"** — recomendaciones offline de antes/durante/después por tipo de evento, y directorio de emergencia.
- **Reporte ciudadano** — foto + ubicación + categoría, con moderación del equipo del Dagran.
- Funciona con conectividad intermitente (caché local con antigüedad visible) y cumple accesibilidad básica (AA, lectores de pantalla).

Detalle completo de alcance, lo que queda explícitamente fuera del MVP, y las 4 fases del plan de trabajo: [`docs/proposal/mvp-proposal.md`](docs/proposal/mvp-proposal.md).

## Estado actual

En arranque: la propuesta, el backlog y la metodología de desarrollo (spec-driven, con agentes de IA) ya están definidos y versionados en este repo. El esqueleto de la app (Expo + TypeScript, Expo Router), el tooling, el CI y las convenciones de código (ADR, Definition of Done, `CLAUDE.md`) están en construcción — ver el plan de implementación en [`docs/superpowers/plans/2026-07-22-harness-bootstrap.md`](docs/superpowers/plans/2026-07-22-harness-bootstrap.md).

## Stack técnico (planeado)

- **App (este repo):** Expo + TypeScript, Expo Router, React Native.
- **Backend (repo aparte, futuro):** Node.js/NestJS, PostgreSQL + PostGIS, Redis.
- **Notificaciones push:** Firebase Cloud Messaging + APNs vía Expo Notifications.
- **Mapas:** MapLibre GL.

## Estructura del proyecto

- `docs/proposal/` — la propuesta del MVP y el backlog completo.
- `docs/specs/` — specs de cada ciclo de trabajo, versionadas.
- `docs/superpowers/plans/` — planes de implementación en curso.
