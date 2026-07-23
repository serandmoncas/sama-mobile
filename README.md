# SAMA Mobile

**Alertas de riesgo hidrometeorológico para el territorio antioqueño, directo al bolsillo de cada ciudadano.**

![CI](https://github.com/serandmoncas/sama-mobile/actions/workflows/ci.yml/badge.svg)

## Qué es esto

Propuesta y desarrollo de un MVP de aplicación móvil (Android/iOS) para el **SAMA — Sistema de Alerta y Monitoreo de Antioquia**, preparada para el **Dagran** (Departamento Administrativo de Gestión del Riesgo de Desastres de Antioquia).

El SAMA ya instrumenta más de 36 municipios con estaciones meteorológicas, pluviómetros, sensores de nivel y cámaras, y ya genera miles de alertas al año — pero su único canal público es un geoportal web que exige que el ciudadano entre a consultar. En una creciente súbita nocturna, nadie está mirando un portal. Esta app cierra esa brecha: lleva la alerta al celular del ciudadano, con georreferenciación por municipio/cuenca, el estado de las estaciones en un mapa, y recomendaciones claras de qué hacer antes, durante y después de una emergencia.

La propuesta completa (contexto, alcance, arquitectura, cronograma) está en [`docs/proposal/mvp-proposal.md`](docs/proposal/mvp-proposal.md); el backlog de 48 tickets en [`docs/proposal/backlog.md`](docs/proposal/backlog.md).

## Sobre este proyecto

Propuesta técnica y de producto, arquitectura y backlog diseñados por **Sergio Monsalve**. El desarrollo del MVP sigue una disciplina de _spec-driven development_ asistido por agentes de IA: cada cambio parte de una spec versionada con criterios de aceptación, pasa por un plan aprobado antes de tocar código, se entrega en incrementos pequeños y se verifica de verdad (no solo "compila"). El ciclo completo y sus convenciones están en [`CLAUDE.md`](CLAUDE.md) y en [`docs/specs/`](docs/specs/).

## Alcance del MVP

- **Alertas push georreferenciadas** por municipio/cuenca, con niveles verde/amarilla/naranja/roja.
- **Mapa de estaciones en tiempo real** (pluviómetros, sensores de nivel, cámaras) con tendencia 24–72h.
- **"¿Qué hago?"** — recomendaciones offline de antes/durante/después por tipo de evento, y directorio de emergencia.
- **Reporte ciudadano** — foto + ubicación + categoría, con moderación del equipo del Dagran.
- Funciona con conectividad intermitente (caché local con antigüedad visible) y cumple accesibilidad básica (AA, lectores de pantalla).

Detalle completo de alcance, lo que queda explícitamente fuera del MVP, y las 4 fases del plan de trabajo: [`docs/proposal/mvp-proposal.md`](docs/proposal/mvp-proposal.md).

## Stack técnico

- **App (este repo):** Expo + TypeScript, Expo Router, React Native.
- **Backend (repo aparte, futuro):** Node.js/NestJS, PostgreSQL + PostGIS, Redis — ver [`docs/adr/0001-repos-separados-app-bff.md`](docs/adr/0001-repos-separados-app-bff.md) para por qué son dos repos.
- **Notificaciones push:** Firebase Cloud Messaging + APNs vía Expo Notifications.
- **Mapas:** MapLibre GL.

## Estado actual

En construcción del harness inicial (esqueleto de la app, tooling, CI, convenciones de spec/ADR) antes de empezar las funcionalidades del MVP. Ver el backlog para las épicas y su estado.

## Cómo correrlo

```bash
npm install
npm start          # abre el menú de Expo: presiona i (iOS), a (Android) o w (web)
```

Otros comandos:

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Jest
npm run format      # Prettier (escribe cambios)
```

## Estructura del proyecto

- `app/` — pantallas y navegación (Expo Router, basado en archivos).
- `docs/proposal/` — la propuesta del MVP y el backlog completo.
- `docs/specs/` — specs de cada ciclo de trabajo, versionadas.
- `docs/adr/` — decisiones de arquitectura documentadas.
- `docs/DEFINITION_OF_DONE.md` — checklist de cierre para cualquier ticket.
- `CLAUDE.md` — el ciclo de desarrollo y las convenciones del repo, para humanos y agentes de IA.
