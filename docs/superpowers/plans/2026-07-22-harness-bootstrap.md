# Harness Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the empty `sama-mobile` repo into a working Expo/TypeScript app skeleton with the 5-tab navigation and alert deep link, full tooling (lint, typecheck, test, CI), and the documentation conventions (ADR, spec template, Definition of Done, CLAUDE.md) needed before any MVP feature ticket starts.

**Architecture:** Single Expo Router app scaffolded from the official `tabs` template, then trimmed and reshaped to SAMA's 5 tabs (Inicio, Mapa, Alertas, ¿Qué hago?, Reportar) plus a top-level `alerta/[id]` route reachable both by tab navigation and by an external URL (`sama://alerta/<id>`), which is how push notifications will later open the alert detail screen.

**Tech Stack:** Expo SDK 57 (`expo` ~57.0.7, `expo-router` ~57.0.7), React Native 0.86.0, React 19.2.3, TypeScript ~6.0.3 (strict), ESLint 9.39.5 (flat config, `eslint-config-expo` 57.0.0) + Prettier 3.9.6, Jest 30 (`jest-expo` preset) + `@testing-library/react-native` 14.0.1, GitHub Actions.

> **Correction (2026-07-22, during Task 2 execution):** the plan originally pinned
> `eslint@10.7.0` (npm's `latest` tag at plan-writing time). That version is
> incompatible with `eslint-config-expo@57.0.0`, which depends on
> `eslint-plugin-react@^7.37.3` — and no published `eslint-plugin-react` supports
> ESLint 10 yet (peer range tops out at `^9.7`). Task 2's implementer hit this as a
> real `npm run lint` crash and correctly stopped instead of guessing. The correct
> pin is `eslint@9.39.5` (npm's `maintenance` dist-tag), which satisfies
> `eslint-config-expo`'s declared peer range (`>=8.10`) and `eslint-plugin-react`'s
> peer range. Task 2's install command below is corrected accordingly.

## Global Constraints

- All work happens on branch `harness/bootstrap`; the plan ends with an open PR against `main` — **do not merge** without explicit user approval.
- Package manager is npm only. No yarn/pnpm lockfiles.
- Do not bump Expo/React Native/TypeScript versions beyond what the `tabs` template installs (expo ~57.0.7, expo-router ~57.0.7, react-native 0.86.0, react 19.2.3, typescript ~6.0.3).
- TypeScript `strict: true` (set by the template) must stay on.
- UI copy is in Spanish (matches the proposal and wireframes in `docs/proposal/mvp-proposal.md`); code identifiers, file names, and commit messages are in English.
- No feature logic in this plan: no map, no push notifications, no offline cache, no BFF calls. Screens are placeholders. (F1–F5 from `docs/proposal/mvp-proposal.md` are out of scope — see `docs/specs/2026-07-22-harness-bootstrap-design.md`.)
- Every verification step must actually be run and its real output checked — never mark a step done because it "should" pass.

## Already done before this plan

Branch `harness/bootstrap` was created from `main`, and `docs/proposal/mvp-proposal.md` +
`docs/proposal/backlog.md` were already written and committed (they're the exact
proposal and backlog text from the project kickoff, not something to regenerate).
`docs/specs/2026-07-22-harness-bootstrap-design.md` (the design spec this plan
implements) was committed to `main` before the branch was cut. Task 1 below starts
from that state — do not recreate `docs/proposal/`.

---

### Task 1: Scaffold the Expo app

**Files:**

- Create: everything under repo root produced by `create-expo-app` with the `tabs` template (`app/`, `assets/`, `components/`, `constants/`, `app.json`, `package.json`, `tsconfig.json`, `.gitignore`, `.vscode/`)

**Interfaces:**

- Produces: a running Expo project with `npm start` available; `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/two.tsx`, `app/_layout.tsx`, `app/modal.tsx`, `app/+not-found.tsx`, `components/Themed.tsx` (exports `Text`, `View`) — later tasks modify or remove these.

- [ ] **Step 1: Generate the template into a scratch subdirectory**

```bash
cd /Users/sergiomonsalve/Code/sama-mobile
npx --yes create-expo-app@4.0.0 .scaffold-tmp --template tabs --no-install --no-agents-md
```

Expected: ends with "✅ Your project is ready!" and creates `.scaffold-tmp/`.

- [ ] **Step 2: Move the generated files into the repo root**

```bash
rm -rf .scaffold-tmp/.git
rsync -a .scaffold-tmp/ ./ --exclude='.git'
rm -rf .scaffold-tmp
```

Expected: `ls` at repo root now shows `app/`, `assets/`, `components/`, `constants/`, `app.json`, `package.json`, `tsconfig.json`, alongside the existing `README.md` and `docs/`.

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

Expected: completes with no error, creates `package-lock.json` and `node_modules/`.

- [ ] **Step 4: Verify the Expo project is well-formed**

```bash
npx expo-doctor
```

Expected: no fatal errors reported (warnings about unrelated future config are acceptable at this stage; if `expo-doctor` reports a fatal error, fix it before continuing — do not proceed with a red doctor check).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Scaffold Expo Router app from the tabs template"
```

---

### Task 2: Add typecheck, ESLint, and Prettier

**Files:**

- Modify: `package.json` (add `typecheck`, `lint`, `format`, `format:check` scripts)
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `.prettierignore`

**Interfaces:**

- Consumes: the scaffolded project from Task 1.
- Produces: `npm run lint`, `npm run typecheck`, `npm run format:check` — used by Task 5's CI workflow.

- [ ] **Step 1: Install tooling**

```bash
npm install --save-dev eslint@9.39.5 eslint-config-expo@57.0.0 eslint-config-prettier@10.1.8 prettier@3.9.6
```

- [ ] **Step 2: Create the ESLint flat config**

`eslint.config.js`:

```js
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
];
```

- [ ] **Step 3: Create the Prettier config**

`.prettierrc.json`:

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all"
}
```

`.prettierignore`:

```
node_modules
.expo
dist
package-lock.json
```

- [ ] **Step 4: Add scripts to `package.json`**

Add to the `"scripts"` object (keep the existing `start`/`android`/`ios`/`web` entries):

```json
"lint": "eslint .",
"typecheck": "tsc --noEmit",
"format": "prettier --write .",
"format:check": "prettier --check ."
```

- [ ] **Step 5: Run format once to normalize the scaffolded files**

```bash
npm run format
```

Expected: reports a list of reformatted files (or none, if already formatted).

- [ ] **Step 6: Verify lint, typecheck, and format all pass**

```bash
npm run lint
npm run typecheck
npm run format:check
```

Expected: all three exit with status 0 and no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add ESLint, Prettier, and typecheck tooling"
```

---

### Task 3: Add Jest and a wiring smoke test

**Files:**

- Modify: `package.json` (add `"test": "jest"` script and `"jest": { "preset": "jest-expo" }` config block)
- Create: `components/__tests__/Themed-test.tsx`

**Interfaces:**

- Consumes: `components/Themed.tsx`'s exported `Text` component (from the Task 1 scaffold; unchanged by this task).
- Produces: `npm test` — used by Task 5's CI workflow and by Task 4's new test.

- [ ] **Step 1: Install testing dependencies**

> **Correction (2026-07-22, caught before dispatch):** the original pin here was
> `react-test-renderer@19.2.8`, which is wrong on two counts: (a) it doesn't match
> the project's `react@19.2.3` (react-test-renderer must match react's version),
> and (b) `@testing-library/react-native@14.0.1` doesn't peer-depend on
> `react-test-renderer` at all — as of v14 it requires the new `test-renderer`
> package instead (confirmed via `npm view @testing-library/react-native@14.0.1
> peerDependencies`, which lists `"test-renderer": "^1.0.0"` and no
> `react-test-renderer` entry). `jest-expo` still bundles its own
> `react-test-renderer@19.2.3` internally for its preset — that's automatic via
> its own dependency tree and needs no explicit install. The corrected command
> below installs `test-renderer@1.2.0` (peer-compatible with `react@^19.0.0`)
> instead of `react-test-renderer`.

```bash
npm install --save-dev jest@30.4.2 jest-expo@57.0.2 @types/jest@30.0.0 @testing-library/react-native@14.0.1 test-renderer@1.2.0
```

- [ ] **Step 2: Add the Jest config and script to `package.json`**

Add `"test": "jest"` to `"scripts"`, and add this top-level key to `package.json`:

```json
"jest": {
  "preset": "jest-expo"
}
```

- [ ] **Step 3: Write the smoke test**

`components/__tests__/Themed-test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { Text } from '../Themed';

test('renders themed text', () => {
  render(<Text>Hola SAMA</Text>);
  expect(screen.getByText('Hola SAMA')).toBeTruthy();
});
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test -- --ci
```

Expected: 1 test suite, 1 test, all passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add Jest with jest-expo preset and a rendering smoke test"
```

---

### Task 4: Build the 5-tab navigation and the alert deep link route

**Files:**

- Modify: `app/(tabs)/_layout.tsx`
- Modify: `app/(tabs)/index.tsx`
- Create: `app/(tabs)/mapa.tsx`
- Create: `app/(tabs)/alertas.tsx`
- Create: `app/(tabs)/que-hago.tsx`
- Create: `app/(tabs)/reportar.tsx`
- Delete: `app/(tabs)/two.tsx`
- Delete: `app/modal.tsx`
- Delete: `components/EditScreenInfo.tsx`
- Delete: `components/ExternalLink.tsx`
- Modify: `app/_layout.tsx` (remove the `modal` screen, add the `alerta/[id]` screen)
- Create: `app/alerta/[id].tsx`
- Create: `app/alerta/__tests__/id-test.tsx`
- Modify: `app.json` (add `"scheme": "sama"`)

**Interfaces:**

- Consumes: `components/Themed.tsx`'s `Text` and `View` (from Task 1, untouched).
- Produces: the route `alerta/[id]` reachable at `sama://alerta/<id>`, rendering the given `id` — this is what a future push-notification deep link (F1/E4-04) will target.

- [ ] **Step 1: Remove the template's placeholder screens**

```bash
rm app/\(tabs\)/two.tsx app/modal.tsx components/EditScreenInfo.tsx components/ExternalLink.tsx
```

- [ ] **Step 2: Rewrite the tab layout with SAMA's 5 tabs**

`app/(tabs)/_layout.tsx`:

```tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="map" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="bell" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="que-hago"
        options={{
          title: '¿Qué hago?',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="question-circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reportar"
        options={{
          title: 'Reportar',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="paper-plane" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 3: Replace the Inicio screen**

`app/(tabs)/index.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function InicioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis territorios</Text>
      <Text>Aún no has añadido ningún municipio.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
```

- [ ] **Step 4: Create the remaining 4 tab placeholder screens**

`app/(tabs)/mapa.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function MapaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mapa de estaciones</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
});
```

`app/(tabs)/alertas.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function AlertasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de alertas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
});
```

`app/(tabs)/que-hago.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function QueHagoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Qué hago?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
});
```

`app/(tabs)/reportar.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function ReportarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
});
```

- [ ] **Step 5: Create the alert detail route**

`app/alerta/[id].tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';

export default function AlertaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alerta {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
});
```

- [ ] **Step 6: Wire the route into the root stack**

Edit `app/_layout.tsx`: find the `Stack.Screen name="modal"` entry (it will look like `<Stack.Screen name="modal" options={{ presentation: 'modal' }} />`) and replace it with:

```tsx
<Stack.Screen name="alerta/[id]" options={{ title: 'Detalle de alerta' }} />
```

- [ ] **Step 7: Add the URL scheme**

Edit `app.json`: inside the top-level `"expo"` object, add:

```json
"scheme": "sama",
```

- [ ] **Step 8: Write the failing test for the alert detail screen**

`app/alerta/__tests__/id-test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import AlertaDetailScreen from '../[id]';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '42' }),
}));

test('muestra el id recibido por parámetro de ruta', () => {
  render(<AlertaDetailScreen />);
  expect(screen.getByText('Alerta 42')).toBeTruthy();
});
```

- [ ] **Step 9: Run the test to verify it fails first (file doesn't exist yet if done out of order) or passes (if Step 5 already created the screen)**

```bash
npx jest app/alerta/__tests__/id-test.tsx
```

If Steps 1–7 were completed first, expected: PASS (1 test). If you're following strict red/green TDD, create the test before Step 5's screen file and confirm it fails with "Cannot find module '../[id]'" first, then create the screen and re-run to see it pass.

- [ ] **Step 10: Run the full test and typecheck suite**

```bash
npm test -- --ci
npm run typecheck
npm run lint
```

Expected: all green. `npm test` now reports 2 test suites (Themed + alerta id), both passing.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "Add SAMA 5-tab navigation and alerta/[id] deep link route"
```

---

### Task 5: GitHub Actions CI, pushed and verified on a real PR

**Files:**

- Create: `.github/workflows/ci.yml`

**Interfaces:**

- Consumes: `npm run lint`, `npm run typecheck`, `npm test`, `npx expo-doctor` (all from Tasks 2–4).
- Produces: a GitHub Actions status check named `build` on every PR against `main`.

- [ ] **Step 1: Write the workflow**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --ci
      - run: npx expo-doctor
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "Add GitHub Actions CI workflow"
```

- [ ] **Step 3: Push the branch and open the PR**

```bash
git push -u origin harness/bootstrap
gh pr create --title "Harness bootstrap: Expo app skeleton, tooling, CI, and SDD conventions" --body "Implements docs/specs/2026-07-22-harness-bootstrap-design.md. Not to be merged until the checklist in that spec is verified end to end (see Task 9 of the plan)." --base main
```

Expected: prints the created PR URL.

- [ ] **Step 4: Watch CI run and confirm it's green**

```bash
gh pr checks --watch
```

Expected: the `build` check finishes with ✓ (success). If it fails, read the failing step's log with `gh run view --log-failed`, fix the root cause locally, commit, push, and re-run this step — do not proceed with a red CI check.

---

### Task 6: ADR-0001 — repos separados app/BFF

**Files:**

- Create: `docs/adr/0001-repos-separados-app-bff.md`

- [ ] **Step 1: Write the ADR**

`docs/adr/0001-repos-separados-app-bff.md`:

```markdown
# ADR-0001: Repos separados para la app y el BFF

**Estado:** Aceptada
**Fecha:** 2026-07-22

## Contexto

El backlog original (ticket E0-05 en `docs/proposal/backlog.md`) propone un monorepo
con la app Expo/TypeScript y el esqueleto del BFF NestJS juntos desde el inicio.

Dos factores pesan en contra de esa opción para este proyecto:

1. El repo ya existe con el nombre `sama-mobile`, no `sama-monorepo` — la intención
   original parece ser un repo de app.
2. El ticket E0-02 (inventario y prueba de las fuentes de datos del Dagran/G-LIMA)
   es un riesgo abierto que bloquea el trabajo de integración del BFF (E2-02, E4-02)
   pero no bloquea el trabajo de esqueleto de la app (navegación, sistema de diseño,
   capa offline). Compartir un monorepo acopla el estado de ambos aunque su avance
   real sea independiente en las primeras semanas.

## Decisión

`sama-mobile` contiene únicamente la app cliente Expo/TypeScript. El BFF NestJS
vivirá en un repositorio aparte (nombre a definir, p. ej. `sama-bff`), creado cuando
arranque el trabajo de la épica E2.

## Consecuencias

- Cuando cambie el contrato de la API entre app y BFF, el cambio requiere coordinar
  dos PRs en dos repos en vez de uno — costo aceptado a cambio de desacoplar las
  cadencias de release (la app pasa por revisión de tiendas; el BFF se despliega
  continuo).
- El CI de este repo (`sama-mobile`) no necesita ejecutar ni el toolchain de NestJS
  ni levantar PostgreSQL/PostGIS — se mantiene simple y rápido.
- Cuando se cree el repo del BFF, su propio README/CLAUDE.md deberá enlazar de vuelta
  a este ADR para que quede claro por qué son dos repos y no uno.
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "Document ADR-0001: separate repos for app and BFF"
```

---

### Task 7: Spec template and Definition of Done

**Files:**

- Create: `docs/specs/TEMPLATE.md`
- Create: `docs/DEFINITION_OF_DONE.md`

- [ ] **Step 1: Write the spec template**

`docs/specs/TEMPLATE.md`:

```markdown
# Spec — <nombre del ticket>

**Fecha:** YYYY-MM-DD
**Estado:** Borrador | Aprobada
**Ticket del backlog:** <ID, p. ej. F1 / E4-04, o "nuevo" si no estaba en el backlog original>

## Historia de usuario

**Como** <quién>
**quiero** <qué>
**para** <por qué>

## Conversación

<Lo que se aclaró hablando con el usuario: bordes, dudas, decisiones de alcance.
No es la spec completa — es el registro de cómo se llegó a los criterios de abajo.>

## Criterios de aceptación

Reglas de negocio, no detalles de implementación. Cada uno se traduce 1-a-1 a una prueba.

- [ ] CA1: <criterio observable por el negocio>
- [ ] CA2: <criterio observable por el negocio>

## Restricciones

<Lo que el agente no puede deducir y debe respetar: idioma, estilo, dependencias
prohibidas, presupuesto de recursos, formatos que no se deben romper.>

## No-objetivos

<Qué explícitamente NO entra en este ciclo.>

## Verificación

<Cómo se va a comprobar de verdad: compila/typecheck → unitarias → integración →
ejecución real. Qué nivel aplica según el tamaño del cambio (ver spec mínima
según escala en la guía de metodología).>
```

**Nota de escala** (de la guía de metodología, para quien use esta plantilla): no toda historia necesita todas las secciones completas — un fix trivial solo necesita una frase de intención + 1 criterio; un cambio estructural necesita todo lo anterior más un plan de pasos.

- [ ] **Step 2: Write the Definition of Done**

`docs/DEFINITION_OF_DONE.md`:

```markdown
# Definition of Done

Checklist aplicable a cualquier ticket de este repo antes de considerarlo
entregado (adaptado de la guía de metodología del proyecto, Parte VIII y XIII).

- [ ] Todos los criterios de aceptación de la spec están cubiertos por prueba.
- [ ] Pasó los niveles aplicables: compila/typecheck → unitarias → integración → E2E,
      según lo que ese ticket necesite.
- [ ] Se ejecutó de verdad al menos una vez (no solo compiló) — corrido a mano o
      verificado con una prueba automática real.
- [ ] Los fallos, si los hubo durante el desarrollo, se reportaron con su salida real
      — nunca "debería funcionar".
- [ ] Las decisiones y _gotchas_ no obvios quedaron registrados (ADR si es una decisión
      de arquitectura; comentario si es un detalle puntual).
- [ ] La spec quedó actualizada si se aprendió algo que la cambia.
- [ ] El ticket se cerró con detalle suficiente para que alguien externo entienda
      qué se hizo y por qué.
- [ ] Las acciones irreversibles (merge a main, push, borrar, publicar) tuvieron
      aprobación explícita del humano — nunca delegadas al agente.
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Add spec template and Definition of Done"
```

---

### Task 8: CLAUDE.md

**Files:**

- Create: `CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md**

`CLAUDE.md`:

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "Add CLAUDE.md for the project's spec-driven development cycle"
```

---

### Task 9: README

**Files:**

- Modify: `README.md`

**Interfaces:** none (documentation only).

Added 2026-07-22 after the design spec was already approved — see the spec's amended
"Incluye" item 7. Purpose is dual: technical onboarding, and a portfolio-facing
description of the project. Per the author's explicit decision (the repo is public):
name the client (Dagran / Gobernación de Antioquia) but **do not** include the
proposal's budget/investment figures.

**Note:** a lightweight version of this README (same framing, but without the CI
badge, the `CLAUDE.md`/ADR links, or run commands — none of those existed yet) was
already written and pushed to `main` on 2026-07-22 at the user's request, ahead of
Tasks 1–8. This step is now about **expanding** that README to the full version
below (which adds the CI badge and links to `CLAUDE.md` and the ADR, both created
in Tasks 6 and 8), not writing it from scratch.

- [ ] **Step 1: Replace the README**

`README.md`:

````markdown
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
````

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

````

- [ ] **Step 2: Verify the CI badge URL matches the actual workflow path**

```bash
cat .github/workflows/ci.yml | head -1
````

Expected: confirms the workflow file exists at `.github/workflows/ci.yml`, matching the badge URL's `.../workflows/ci.yml/badge.svg` path.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Replace placeholder README with project overview and portfolio context"
```

---

### Task 10: End-to-end verification against the Definition of Done

**Files:** none (verification only; may produce fix commits if something fails)

- [ ] **Step 1: Run the full verification chain fresh**

```bash
rm -rf node_modules
npm ci
npm run lint
npm run typecheck
npm test -- --ci
npx expo-doctor
```

Expected: every command exits 0. If any fails, fix the root cause, commit, and re-run this whole step before continuing — do not skip ahead with a red step.

- [ ] **Step 2: Run the app and manually verify the 5 tabs**

```bash
npm start
```

In the terminal UI, press `i` (iOS simulator) or `a` (Android emulator) — whichever is available in this environment. Manually tap through all 5 tabs (Inicio, Mapa, Alertas, ¿Qué hago?, Reportar) and confirm each renders its placeholder title without crashing. Stop the dev server with Ctrl+C when done.

- [ ] **Step 3: Manually verify the deep link**

With the dev server running (`npm start` in one terminal) and a simulator open, run in another terminal:

```bash
npx uri-scheme open sama://alerta/42 --ios
```

(Use `--android` instead of `--ios` if testing on Android.) Expected: the app navigates to the alert detail screen and displays "Alerta 42".

- [ ] **Step 4: Confirm every Definition of Done item from the spec**

Go through `docs/specs/2026-07-22-harness-bootstrap-design.md`'s Definition of Done section and check off each item against what actually exists in the repo (not from memory):

```bash
ls docs/proposal/mvp-proposal.md docs/proposal/backlog.md
ls docs/adr/0001-repos-separados-app-bff.md
ls docs/specs/TEMPLATE.md docs/DEFINITION_OF_DONE.md
ls CLAUDE.md
grep -q "SAMA Mobile" README.md && echo "README updated" || echo "README still placeholder"
gh pr checks
```

Expected: every file listed exists, the README check prints "README updated", and `gh pr checks` shows the CI check green.

- [ ] **Step 5: Push any fix commits and leave the PR ready for human review**

```bash
git push
gh pr view --web
```

Report to the user: PR URL, CI status, and the DoD checklist results. **Do not merge the PR** — that decision belongs to the user.
