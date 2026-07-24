# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`sama-mobile` is the citizen-facing mobile app (Expo/TypeScript) for SAMA — Antioquia's
disaster alert and monitoring system, built for Dagran. It notifies push alerts for the
user's chosen municipalities, shows real-time station data on a map, and gives clear
before/during/after guidance for floods and flash floods. Full context:
`docs/proposal/mvp-proposal.md` and `docs/proposal/backlog.md`.

The BFF (NestJS) lives in a separate repository — see `docs/adr/0001-repos-separados-app-bff.md`.

## Commands

- `npm start` — start the Expo dev server
- `npm run android` / `npm run ios` / `npm run web` — start on a specific platform
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run format` / `npm run format:check` — Prettier
- `npm test` — Jest (single run: add `-- --ci`; watch mode: `npm test -- --watch`)
- Run a single test file: `npx jest path/to/file-test.tsx`

All four of `lint`, `typecheck`, `test`, and `npx expo-doctor` must pass before any PR merges — this is enforced in `.github/workflows/ci.yml`.

## Development cycle for this repo

This project follows spec-driven development, as documented in
`docs/specs/2026-07-22-harness-bootstrap-design.md` and the methodology it's based on.
For any change beyond a trivial fix:

1. **Spec first.** Write or update a file in `docs/specs/` using `docs/specs/TEMPLATE.md`.
   The spec is the source of truth — code, tests, and docs are derived from it, not the
   other way around. A spec that only exists in chat is lost at the end of the session.
2. **Plan, then approve.** For anything beyond a one-line fix, propose which files will
   be touched and in what order before writing code. Get explicit approval before
   proceeding — this is the "puerta de plan" from the methodology, and it exists to
   avoid 800 lines written in the wrong direction.
3. **Small increments.** Each change should compile and be testable on its own. Don't
   mix refactor + feature + fix in one step.
4. **Verify for real.** "Compiles" is not "works." Run the actual tests, run the app,
   and report real output — never claim something passes without having run it.
5. **Record decisions.** Architecture-level decisions get an ADR in `docs/adr/`
   (see `docs/adr/0001-repos-separados-app-bff.md` for the format). Non-obvious
   gotchas get written down in the spec or the ADR — don't make the next session
   rediscover them.
6. **Definition of Done.** Before calling a ticket finished, walk through
   `docs/DEFINITION_OF_DONE.md`.

## Antipatterns to avoid (from the project methodology)

- Writing a spec only in the chat instead of a versioned file.
- Generating code without a spec ("mucho plausible-pero-incorrecto").
- Accepting a diff without understanding it — if you can't explain a line, don't merge it.
- Treating "it compiles" or "the demo works" as proof of correctness.
- One commit that touches many unrelated concerns at once.
- Long-lived branches instead of small, short-lived ones merged frequently.
- Skipping observability/logging until users report the problem.

## Architecture

- **Routing:** Expo Router, file-based, under `app/`. Tabs live in `app/(tabs)/`
  (Inicio, Mapa, Alertas, ¿Qué hago?, Reportar). The alert detail screen is
  `app/alerta/[id].tsx`, reachable both from the Alertas tab and via the deep link
  `sama://alerta/<id>` (the target for push notifications in a future ticket).
- **Shared UI primitives:** `components/Themed.tsx` exports theme-aware `Text` and
  `View` — use these instead of the raw React Native components for anything that
  should respect light/dark mode.
- **No feature logic yet.** As of the harness bootstrap, all 5 tab screens are
  placeholders. Map, push notifications, offline cache, and citizen reports are
  future tickets tracked in `docs/proposal/backlog.md` (epics E3, E4, E1-04, E6).

## Conventions

- UI copy is in Spanish (matches the proposal and wireframes). Code identifiers,
  file names, comments, and commit messages are in English.
- Package manager is npm only — no yarn.lock or pnpm-lock.yaml.
- TypeScript strict mode is on; don't relax it.
