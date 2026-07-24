# Spec — Harness del proyecto SAMA mobile (bootstrap)

**Fecha:** 2026-07-22
**Estado:** Aprobada
**Ciclo:** E0-05 (Monorepo, CI/CD y entornos) adaptado a repo único de app móvil
**Metodología de referencia:** "Ciclo de Desarrollo de Software Moderno — Guía Unificada" (Jorge Johnson, junio 2026), `docs/proposal/`

## Intención

Dejar el repositorio `sama-mobile` en un estado desde el cual cualquier ticket futuro del backlog (F1–F5 y el resto de épicas E1–E8) se pueda trabajar siguiendo el ciclo spec → plan aprobado → incrementos pequeños → verificación real → ADR si aplica. Este ciclo NO construye ninguna funcionalidad del MVP — construye la disciplina y el esqueleto sobre el que se construirá.

**Quién lo nota:** cualquier desarrollador o agente de IA que abra este repo después de hoy.
**Cómo se sabrá que quedó resuelto:** puede clonar el repo, correr `npm install`, arrancar la app, ver los 5 tabs navegables, y encontrar en `CLAUDE.md` y `docs/` todo lo necesario para empezar el primer ticket real sin tener que releer el PDF de la metodología.

## Decisión previa (contexto)

Se evaluó monorepo (app + BFF NestJS juntos, como sugiere el backlog original) vs. repos separados. Se eligió **repos separados**: el repo `sama-mobile` es solo la app; el BFF será un repo aparte cuando arranque el trabajo de E2. Razón completa en `docs/adr/0001-repos-separados-app-bff.md`.

## Alcance de este ciclo

### Incluye

1. Esqueleto de la app Expo + TypeScript con Expo Router (5 tabs + ruta de detalle de alerta para deep linking).
2. Tooling: ESLint + Prettier (config Expo), TypeScript estricto, Jest + React Native Testing Library.
3. CI en GitHub Actions: lint, typecheck, test, `expo-doctor` en cada PR.
4. Convenciones documentales versionadas en `docs/`: specs, ADRs, Definition of Done.
5. La propuesta del MVP y el backlog completo (recibidos en la conversación de arranque) copiados a `docs/proposal/` como fuente de verdad versionada — dejan de vivir solo en el chat.
6. `CLAUDE.md` que codifica el ciclo de la guía (spec-driven development, incrementos pequeños, verificación real, antipatrones a evitar) como reglas operativas para agentes de IA en este repo, incluyendo los comandos concretos de este proyecto.
7. **(Añadido 2026-07-22, tras aprobar el diseño original)** `README.md` real, con doble propósito: onboarding técnico (qué es, cómo correrlo, dónde están los docs) y pieza de portafolio profesional. El cliente (Dagran/Gobernación de Antioquia) se nombra explícitamente; las cifras de presupuesto/inversión de la propuesta **no** se incluyen en el README público — decisión explícita del autor dado que el repo es público.

### Explícitamente fuera de este ciclo (no-objetivos)

- Cualquier pantalla con lógica real: mapa, alertas push, contenido offline, reporte ciudadano (F1–F5).
- El BFF NestJS (repo aparte, futuro).
- Integración con MapLibre, Firebase/APNs, SQLite/MMKV.
- Builds EAS o publicación en tiendas.
- Pruebas E2E (Maestro/Detox) — se añaden en la Fase 3 del backlog original, cuando haya pantallas reales que probar.

## Stack técnico

| Decisión                  | Elección                                          | Razón                                                                                                                                     |
| ------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Framework                 | Expo (managed) + TypeScript estricto              | OTA updates (EAS Update), builds reproducibles (EAS Build), es el estándar actual                                                         |
| Navegación                | Expo Router                                       | Deep linking y rutas tipadas sin configuración manual; requisito explícito de E1-01 (abrir detalle de alerta desde push)                  |
| Gestor de paquetes        | npm                                               | Ya instalado en el entorno, cero fricción adicional (KISS)                                                                                |
| Lint/format               | ESLint (config oficial Expo) + Prettier           | Estándar del ecosistema Expo                                                                                                              |
| Testing unitario          | Jest + React Native Testing Library               | Estándar del ecosistema RN                                                                                                                |
| CI                        | GitHub Actions                                    | Remoto ya existe en `github.com/serandmoncas/sama-mobile`                                                                                 |
| Tracking de tickets/specs | Markdown versionado en `docs/` (no GitHub Issues) | Alineado con "la spec es fuente de verdad, vive en archivo versionado" de la guía; los agentes de IA la leen directamente sin API externa |

## Estructura del repositorio

```
sama-mobile/
├── app/                        # Expo Router — rutas por archivo
│   ├── (tabs)/
│   │   ├── index.tsx           # Inicio ("Mis territorios")
│   │   ├── mapa.tsx
│   │   ├── alertas.tsx
│   │   ├── que-hago.tsx
│   │   └── reportar.tsx
│   ├── alerta/[id].tsx         # Detalle de alerta — target del deep link
│   └── _layout.tsx
├── components/                 # Componentes compartidos (Themed, useColorScheme)
├── constants/                  # Colors.ts y otras constantes compartidas
├── docs/
│   ├── proposal/
│   │   ├── mvp-proposal.md
│   │   └── backlog.md
│   ├── specs/
│   │   ├── TEMPLATE.md
│   │   └── 2026-07-22-harness-bootstrap-design.md   (este archivo)
│   ├── adr/
│   │   └── 0001-repos-separados-app-bff.md
│   └── DEFINITION_OF_DONE.md
├── CLAUDE.md
├── README.md
└── .github/workflows/ci.yml
```

## Definition of Done de este ciclo

- [ ] La app arranca en Expo Go / simulador sin errores.
- [ ] Los 5 tabs navegan y el deep link `sama://alerta/[id]` abre la pantalla de detalle (vacía, solo demuestra el routing).
- [ ] `npm run lint`, `npm run typecheck`, `npm test` pasan en verde — verificado ejecutándolos, no asumido.
- [ ] CI corre en GitHub Actions y pasa en un PR real.
- [ ] ADR-0001 (repos separados) documentado y commiteado.
- [ ] `docs/proposal/` contiene la propuesta y el backlog completos.
- [ ] `CLAUDE.md` explica el ciclo, comandos y convenciones del repo.
- [ ] `docs/specs/TEMPLATE.md` y `docs/DEFINITION_OF_DONE.md` existen para que el próximo ticket los use sin reinventar el formato.
- [ ] `README.md` reemplaza el placeholder original: describe el proyecto, el cliente (sin cifras de presupuesto), el stack, cómo correrlo y enlaza a `docs/proposal/`, `docs/adr/`, `CLAUDE.md`.

## Verificación

Compila/typecheck → lint → test unitario (smoke de que Jest está bien cableado) → ejecución real (arrancar la app y navegar los 5 tabs a mano, registrar el resultado). Ningún nivel se salta.

## Riesgos conocidos

- Expo Router y la versión de Expo SDK evolucionan rápido. El pin real de reproducibilidad es `package-lock.json` (committeado) + `npm ci` en CI, no los rangos `^`/`~` de `package.json` — esos permiten actualizaciones menores locales, pero CI y cualquier `npm ci` fresco instalan exactamente lo que dice el lockfile. Se documenta en el ADR si hay que actualizar antes de la Fase 1.
- Este ciclo no valida las fuentes de datos del Dagran (E0-02 del backlog original) — sigue siendo un riesgo abierto y bloqueante para el trabajo futuro de integración de datos, fuera del alcance de este ciclo.
