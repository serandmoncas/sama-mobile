# Accessibility Base (E1-05) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix touch targets to a guaranteed ≥44px, add screen-reader roles/states/labels to every interactive element and screen title (5 tabs + 3 onboarding screens), and give `TerritoryCard` a combined accessible label.

**Architecture:** No new components or files beyond tests — this plan only adds accessibility props (`accessibilityRole`, `accessibilityState`, `accessibilityLabel`) and explicit `minHeight: 44` styles to existing screens and components. No color/token changes (AA contrast already verified in the design-system cycle).

**Tech Stack:** Same as prior plans (Expo Router, TypeScript strict, Jest + `jest-expo`, `@testing-library/react-native`). Tests use RNTL's accessibility queries (`getByRole`, `getByLabelText`), verified working in this exact repo before being written into this plan.

## Global Constraints

- Branch `accessibility`, branched from `main`.
- No new dependencies. No color/token changes — `constants/Colors.ts` and `constants/AlertColors.ts` are untouched.
- Do not modify `app/_layout.tsx`, `app/alerta/[id].tsx`, or any screen's business logic — only accessibility props and touch-target styles.
- UI copy in Spanish; code identifiers in English. TypeScript strict; no `any`.
- The following RNTL query patterns were hand-verified working in this exact repo before being written into this plan — use them exactly as shown:
  - `screen.getByRole('checkbox', { checked: true })` — filters by role + accessibility state.
  - `screen.getByLabelText('exact label text')` — finds by `accessibilityLabel`.
  - `screen.getByRole('button', { name: 'Volver' })` — RNTL derives the accessible "name" from a Pressable's nested `<Text>` child automatically when no explicit `accessibilityLabel` is set; this works identically for `getByRole('header', { name: '...' })` on a `Text` element.
  - Touch-target size cannot be measured from rendered layout in Jest (no real layout engine) — verify by asserting the flattened style object contains `minHeight: 44`, e.g. `Object.assign({}, ...element.props.style).minHeight` (array-style) or `Object.assign({}, element.props.style).minHeight` (single-object style).
- Every verification step must actually be run and its real output checked — never mark a step done because it "should" pass.

---

### Task 1: Municipios touch targets and checkbox accessibility

**Files:**
- Modify: `app/onboarding/municipios.tsx`
- Modify: `app/onboarding/__tests__/municipios-test.tsx`

**Interfaces:** none new — this task only adds accessibility props and a style change to an existing screen.

- [ ] **Step 1: Write the failing tests**

Add these tests to the END of `app/onboarding/__tests__/municipios-test.tsx` (keep all existing tests and imports as they are; add `within` if not already imported — check the existing import line first):

```tsx
test('las filas de municipio declaran minHeight 44', async () => {
  await render(<MunicipiosScreen />);
  await waitFor(() => screen.getByText('Zaragoza'));
  const row = screen.getByTestId('municipio-Zaragoza');
  const flatStyle = Object.assign({}, ...row.props.style);
  expect(flatStyle.minHeight).toBe(44);
});

test('las filas de municipio tienen role checkbox con estado y label correctos', async () => {
  await render(<MunicipiosScreen />);
  await waitFor(() => screen.getByText('Zaragoza'));
  const unchecked = screen.getByLabelText('Zaragoza, no seleccionado');
  expect(unchecked.props.accessibilityRole).toBe('checkbox');
  expect(unchecked.props.accessibilityState).toEqual({ checked: false });

  fireEvent.press(unchecked);
  await waitFor(() => {
    const checked = screen.getByLabelText('Zaragoza, seleccionado');
    expect(checked.props.accessibilityState).toEqual({ checked: true });
  });
});

test('Volver tiene accessibilityRole button y minHeight 44', async () => {
  mockedParams.mockReturnValue({ standalone: 'true' });
  await render(<MunicipiosScreen />);
  await waitFor(() => screen.getByText('Volver'));
  const volver = screen.getByRole('button', { name: 'Volver' });
  const flatStyle = Object.assign({}, volver.props.style);
  expect(flatStyle.minHeight).toBe(44);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest app/onboarding/__tests__/municipios-test.tsx
```

Expected: the 3 new tests fail (no `minHeight`, no `accessibilityRole`/`accessibilityState`/`accessibilityLabel` on the rows or Volver yet). The pre-existing tests in this file should still pass.

- [ ] **Step 3: Update the screen**

Edit `app/onboarding/municipios.tsx`. Replace the `isStandalone &&` block and the municipio-row `Pressable` with:

```tsx
{isStandalone && (
  <Pressable
    onPress={() => router.back()}
    accessibilityRole="button"
    style={styles.volver}
  >
    <Text style={{ color: colors.tint }}>Volver</Text>
  </Pressable>
)}
<Text style={styles.title}>Elige tu municipio</Text>
{PILOT_MUNICIPIOS.map((name) => {
  const isSelected = selected.includes(name);
  return (
    <Pressable
      key={name}
      testID={`municipio-${name}`}
      onPress={() => toggle(name)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${name}, ${isSelected ? 'seleccionado' : 'no seleccionado'}`}
      style={[
        styles.row,
        {
          borderColor: colors.border,
          backgroundColor: isSelected ? colors.surface : 'transparent',
        },
      ]}
    >
      <Text>{name}</Text>
      <Text>{isSelected ? '✓' : ''}</Text>
    </Pressable>
  );
})}
```

(Only the `Pressable` elements changed — the surrounding `return`, `Button`, and everything else in the file stays as-is.)

Update the `styles` object: add `minHeight: 44` to `row`, and add a new `volver` style:

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    ...Typography.title,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
  },
  volver: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
  },
});
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest app/onboarding/__tests__/municipios-test.tsx
```

Expected: PASS, 8 tests total (5 pre-existing + 3 new).

- [ ] **Step 5: Verify lint and typecheck**

```bash
npm run lint
npm run typecheck
```

Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add checkbox accessibility and 44px touch targets to municipios screen"
```

---

### Task 2: Header roles on all 8 screens

**Files:**
- Modify: `app/(tabs)/index.tsx`, `app/(tabs)/mapa.tsx`, `app/(tabs)/alertas.tsx`, `app/(tabs)/que-hago.tsx`, `app/(tabs)/reportar.tsx`
- Modify: `app/onboarding/index.tsx`, `app/onboarding/municipios.tsx`, `app/onboarding/notificaciones.tsx`
- Modify: `app/(tabs)/__tests__/index-test.tsx`, `app/onboarding/__tests__/index-test.tsx`, `app/onboarding/__tests__/municipios-test.tsx`, `app/onboarding/__tests__/notificaciones-test.tsx`
- Create: `app/(tabs)/__tests__/mapa-test.tsx`, `app/(tabs)/__tests__/alertas-test.tsx`, `app/(tabs)/__tests__/que-hago-test.tsx`, `app/(tabs)/__tests__/reportar-test.tsx`

**Interfaces:** none new — adds `accessibilityRole="header"` to each screen's main title `Text`.

- [ ] **Step 1: Write the failing tests for the 4 currently-untested tab screens**

`app/(tabs)/__tests__/mapa-test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import MapaScreen from '../mapa';

test('el título tiene accessibilityRole header', async () => {
  await render(<MapaScreen />);
  const header = screen.getByRole('header', { name: 'Mapa de estaciones' });
  expect(header).toBeTruthy();
});
```

`app/(tabs)/__tests__/alertas-test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import AlertasScreen from '../alertas';

test('el título tiene accessibilityRole header', async () => {
  await render(<AlertasScreen />);
  const header = screen.getByRole('header', { name: 'Historial de alertas' });
  expect(header).toBeTruthy();
});
```

`app/(tabs)/__tests__/que-hago-test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import QueHagoScreen from '../que-hago';

test('el título tiene accessibilityRole header', async () => {
  await render(<QueHagoScreen />);
  const header = screen.getByRole('header', { name: '¿Qué hago?' });
  expect(header).toBeTruthy();
});
```

`app/(tabs)/__tests__/reportar-test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import ReportarScreen from '../reportar';

test('el título tiene accessibilityRole header', async () => {
  await render(<ReportarScreen />);
  const header = screen.getByRole('header', { name: 'Reportar' });
  expect(header).toBeTruthy();
});
```

Add this test to the END of `app/(tabs)/__tests__/index-test.tsx` (keep existing tests/mocks as-is; this screen needs `onboardingCompleted` set first since it redirects otherwise):

```tsx
test('el título tiene accessibilityRole header', async () => {
  await AsyncStorage.setItem('onboardingCompleted', 'true');
  await render(<InicioScreen />);
  const header = await screen.findByRole('header', { name: 'Mis territorios' });
  expect(header).toBeTruthy();
});
```

Add this test to the END of `app/onboarding/__tests__/index-test.tsx`:

```tsx
test('el título tiene accessibilityRole header', async () => {
  await render(<BienvenidaScreen />);
  const header = screen.getByRole('header', { name: 'SAMA' });
  expect(header).toBeTruthy();
});
```

Add this test to the END of `app/onboarding/__tests__/municipios-test.tsx`:

```tsx
test('el título tiene accessibilityRole header', async () => {
  await render(<MunicipiosScreen />);
  const header = screen.getByRole('header', { name: 'Elige tu municipio' });
  expect(header).toBeTruthy();
});
```

Add this test to the END of `app/onboarding/__tests__/notificaciones-test.tsx`:

```tsx
test('el título tiene accessibilityRole header', async () => {
  await render(<NotificacionesScreen />);
  const header = screen.getByRole('header', {
    name: 'Recibe alertas al instante',
  });
  expect(header).toBeTruthy();
});
```

- [ ] **Step 2: Run all the new/modified test files to verify they fail**

```bash
npx jest "app/(tabs)/__tests__/mapa-test.tsx" "app/(tabs)/__tests__/alertas-test.tsx" "app/(tabs)/__tests__/que-hago-test.tsx" "app/(tabs)/__tests__/reportar-test.tsx"
npx jest "app/(tabs)/__tests__/index-test.tsx" app/onboarding/__tests__/
```

Expected: the 4 new screen-test files fail with "Cannot find module" (files don't exist yet); the header-role tests in the 4 existing test files fail because the title `Text` elements don't have `accessibilityRole="header"` yet.

- [ ] **Step 3: Add `accessibilityRole="header"` to each screen's title**

`app/(tabs)/index.tsx`: change `<Text style={styles.title}>Mis territorios</Text>` to `<Text style={styles.title} accessibilityRole="header">Mis territorios</Text>`. Nothing else in the file changes.

`app/(tabs)/mapa.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function MapaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Mapa de estaciones
      </Text>
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
      <Text style={styles.title} accessibilityRole="header">
        Historial de alertas
      </Text>
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
      <Text style={styles.title} accessibilityRole="header">
        ¿Qué hago?
      </Text>
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
      <Text style={styles.title} accessibilityRole="header">
        Reportar
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
});
```

`app/onboarding/index.tsx`: change `<Text style={styles.title}>SAMA</Text>` to `<Text style={styles.title} accessibilityRole="header">SAMA</Text>`. Nothing else changes.

`app/onboarding/municipios.tsx`: change `<Text style={styles.title}>Elige tu municipio</Text>` (from Task 1's edit) to `<Text style={styles.title} accessibilityRole="header">Elige tu municipio</Text>`.

`app/onboarding/notificaciones.tsx`: change `<Text style={styles.title}>Recibe alertas al instante</Text>` to `<Text style={styles.title} accessibilityRole="header">Recibe alertas al instante</Text>`.

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest "app/(tabs)/__tests__/mapa-test.tsx" "app/(tabs)/__tests__/alertas-test.tsx" "app/(tabs)/__tests__/que-hago-test.tsx" "app/(tabs)/__tests__/reportar-test.tsx"
npx jest "app/(tabs)/__tests__/index-test.tsx" app/onboarding/__tests__/
```

Expected: all PASS.

- [ ] **Step 5: Verify lint and typecheck**

```bash
npm run lint
npm run typecheck
```

Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add accessibilityRole=header to all 8 screen titles"
```

---

### Task 3: TerritoryCard combined accessibility label

**Files:**
- Modify: `components/AlertLevelChip.tsx` (export `LEVEL_LABELS` instead of keeping it private)
- Modify: `components/TerritoryCard.tsx`
- Modify: `components/__tests__/TerritoryCard-test.tsx`

**Interfaces:**
- Produces: `AlertLevelChip.tsx` now exports `LEVEL_LABELS: Record<AlertLevel, string>` alongside its existing default export — consumed by `TerritoryCard.tsx` so both components share one source of truth for level display names (DRY — no duplicated label mapping).

- [ ] **Step 1: Write the failing test**

Add this test to the END of `components/__tests__/TerritoryCard-test.tsx`:

```tsx
test('tiene un accessibilityLabel combinando nombre y nivel', async () => {
  await render(<TerritoryCard name="Zaragoza" alertLevel="roja" />);
  const card = screen.getByLabelText('Zaragoza, nivel roja');
  expect(card).toBeTruthy();
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest components/__tests__/TerritoryCard-test.tsx
```

Expected: FAIL — no element has that `accessibilityLabel` yet.

- [ ] **Step 3: Export `LEVEL_LABELS` from AlertLevelChip**

In `components/AlertLevelChip.tsx`, change:

```ts
const LEVEL_LABELS: Record<AlertLevel, string> = {
```

to:

```ts
export const LEVEL_LABELS: Record<AlertLevel, string> = {
```

Nothing else in that file changes.

- [ ] **Step 4: Add the combined label to TerritoryCard**

In `components/TerritoryCard.tsx`, change the import line:

```tsx
import { AlertLevelChip } from './AlertLevelChip';
```

to:

```tsx
import { AlertLevelChip, LEVEL_LABELS } from './AlertLevelChip';
```

Then add `accessibilityLabel` to the `Pressable`:

```tsx
<Pressable
  testID={testID}
  onPress={onPress}
  accessibilityRole={onPress ? 'button' : undefined}
  accessibilityLabel={`${name}, nivel ${LEVEL_LABELS[alertLevel].toLowerCase()}`}
  style={[
    styles.card,
    { backgroundColor: colors.surface, borderColor: colors.border },
  ]}
>
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx jest components/__tests__/TerritoryCard-test.tsx
```

Expected: PASS, 2 tests (1 pre-existing + 1 new).

- [ ] **Step 6: Verify lint and typecheck**

```bash
npm run lint
npm run typecheck
```

Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add combined accessibility label to TerritoryCard"
```

---

### Task 4: Full verification

**Files:** none (verification only; may produce fix commits if something fails)

- [ ] **Step 1: Run the full automated chain fresh**

```bash
rm -rf node_modules
npm ci
npm run lint
npm run typecheck
npm run format:check
npm test -- --ci
```

Expected: all exit 0. `npm test` reports 19 test suites total (15 from before this plan + 4 new: `mapa-test.tsx`, `alertas-test.tsx`, `que-hago-test.tsx`, `reportar-test.tsx`), with the exact new test count depending on how many were added across Tasks 1-3 — read the real number from your own run rather than assuming, and sanity-check it against: 39 (baseline) + 3 (Task 1) + 8 (Task 2, one header test per screen) + 1 (Task 3) = 51.

- [ ] **Step 2: Manual/visual check if a simulator is available**

If an iOS simulator or Android emulator is available in this environment, boot it, run `npx expo start --ios` (or `--android`), and manually confirm: the municipio rows in `/onboarding/municipios` visually look tappable (no layout regression from the `minHeight: 44` change), and the "Volver" link has more breathing room than before without looking obviously oversized. If no simulator/synthetic-tap tool is available, state that plainly in your report — do not claim a check you didn't perform. Screen-reader behavior itself (VoiceOver/TalkBack) is out of scope for this ticket per the spec's No-objetivos; the RNTL accessibility-query tests are the verification for that.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin accessibility
gh pr create --title "Accessibility base: 44px touch targets, checkbox/header roles, combined labels" --body "Implements docs/specs/2026-07-24-accessibility.md (E1-05). Scope widened to include the 3 onboarding screens (not just the 5 tabs named in the original ticket) since those are the only screens with real interactive elements today. No color/token changes — AA contrast was already verified in the design-system cycle." --base main
gh pr checks --watch
```

Expected: PR opens against `main`, CI passes. Do not merge — leave it open for human review.
