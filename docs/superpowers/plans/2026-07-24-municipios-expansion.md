# Municipios Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the selectable municipio list from 3 pilot municipios to 28 (the 3 pilots + Valle de Aburrá + the 15 most populated municipios elsewhere in Antioquia), and show an explicit "cobertura de estaciones aún no confirmada" notice for the 25 that don't have real SAMA stations yet — both at selection time (onboarding) and on the main screen (Inicio), so the coverage gap isn't only disclosed once and forgotten.

**Architecture:** `constants/Municipios.ts` becomes the single source of truth for which municipios have confirmed coverage. `app/onboarding/municipios.tsx` renders all 28 in a scrollable list (28 rows no longer fit on screen) with a per-row coverage caption. `components/TerritoryCard.tsx` gains an optional `coberturaConfirmada` prop (default `true`, so existing call sites are unaffected) that renders the same caption. `app/(tabs)/index.tsx` (Inicio) wires the two together.

**Tech Stack:** Same as prior plans (Expo Router, TypeScript strict, Jest + `jest-expo`, `@testing-library/react-native`). No new dependencies.

## Global Constraints

- Branch `municipios-expansion`, branched from `main`.
- No new dependencies. No color/token changes.
- Do not modify `app/_layout.tsx`, `app/alerta/[id].tsx`, or any screen other than `app/onboarding/municipios.tsx` and `app/(tabs)/index.tsx`.
- UI copy in Spanish; code identifiers in English. TypeScript strict; no `any`.
- Do not fabricate phone numbers or station data — this plan only adds municipio names (public DANE population data, already verified with the user) and the coverage notice.
- Keep accessibility conventions from E1-05 (`accessibilityRole`, `accessibilityState`, `minHeight: 44`) on everything touched.
- **Gotcha hand-verified in this exact repo, must be applied exactly as shown:** `components/Themed.tsx`'s `View` sets `backgroundColor: colors.background` by default (an opaque fill), unlike plain React Native `View`. Wrapping text in a Themed `View` inside a row/card that already has its own `backgroundColor` (e.g. `colors.surface` on a selected row) paints an opaque box that visually breaks the existing highlight — confirmed by reading `components/Themed.tsx` directly. Any new wrapper `View` introduced in this plan must explicitly set `backgroundColor: 'transparent'` in its style to cancel this default.
- The following pattern was hand-verified working in this exact repo before being written into this plan — use it exactly as shown: `fireEvent.press` followed by an assertion on newly-changed `accessibilityState` must be wrapped in `await waitFor(...)`.
- Every verification step must actually be run and its real output checked — never mark a step done because it "should" pass.

---

### Task 1: Expand the municipios constant

**Files:**

- Modify: `constants/Municipios.ts`

**Interfaces:**

- Produces: `MUNICIPIOS_CON_COBERTURA_CONFIRMADA: readonly string[]` (the 3 pilots), `MUNICIPIOS_SIN_COBERTURA_CONFIRMADA: readonly string[]` (the other 25), `MUNICIPIOS: readonly string[]` (all 28, pilots first), `tieneCoberturaConfirmada(municipio: string): boolean` — all consumed by Task 2 and Task 4. Replaces the old `PILOT_MUNICIPIOS` export entirely (its only consumer, `app/onboarding/municipios.tsx`, is updated in Task 2).

- [ ] **Step 1: Replace the file's contents**

```ts
// Municipios con estaciones SAMA confirmadas — ver docs/specs/2026-07-24-onboarding.md.
export const MUNICIPIOS_CON_COBERTURA_CONFIRMADA = [
  'Zaragoza',
  'Carepa',
  'Turbo',
] as const;

// Valle de Aburrá + los 15 más poblados del resto de Antioquia (población DANE,
// ver docs/specs/2026-07-24-municipios-expansion.md). Seleccionables en la app,
// pero sin estaciones SAMA confirmadas todavía — se muestra un aviso.
export const MUNICIPIOS_SIN_COBERTURA_CONFIRMADA = [
  'Medellín',
  'Bello',
  'Itagüí',
  'Envigado',
  'Sabaneta',
  'La Estrella',
  'Caldas',
  'Copacabana',
  'Girardota',
  'Barbosa',
  'Apartadó',
  'Rionegro',
  'Caucasia',
  'Chigorodó',
  'Necoclí',
  'El Carmen de Viboral',
  'Marinilla',
  'La Ceja',
  'Guarne',
  'El Bagre',
  'Puerto Berrío',
  'Yarumal',
  'Tarazá',
  'Andes',
  'Urrao',
] as const;

export const MUNICIPIOS = [
  ...MUNICIPIOS_CON_COBERTURA_CONFIRMADA,
  ...MUNICIPIOS_SIN_COBERTURA_CONFIRMADA,
] as const;

export function tieneCoberturaConfirmada(municipio: string): boolean {
  return (MUNICIPIOS_CON_COBERTURA_CONFIRMADA as readonly string[]).includes(
    municipio,
  );
}
```

- [ ] **Step 2: Verify it typechecks**

```bash
npm run typecheck
```

Expected: exit 0. This will show errors in `app/onboarding/municipios.tsx` (still importing the now-deleted `PILOT_MUNICIPIOS`) — that's expected and fixed in Task 2. If typecheck reports errors ONLY in that one file, about that one missing export, this step is still a pass for Task 1's purposes.

- [ ] **Step 3: Verify formatting**

```bash
npx prettier --check constants/Municipios.ts
```

Expected: "All matched files use Prettier code style!"

- [ ] **Step 4: Commit**

```bash
git add constants/Municipios.ts
git commit -m "Expand municipios list to Valle de Aburrá + 15 most populated"
```

---

### Task 2: Scrollable municipio selector with coverage notice

**Files:**

- Modify: `app/onboarding/municipios.tsx`
- Modify: `app/onboarding/__tests__/municipios-test.tsx`

**Interfaces:**

- Consumes: `MUNICIPIOS`, `tieneCoberturaConfirmada` from `@/constants/Municipios` (Task 1).

- [ ] **Step 1: Write the failing tests**

Add these tests to the END of `app/onboarding/__tests__/municipios-test.tsx`, and add one import line at the top:

Add to the imports (near the existing `import { getSelectedMunicipios } from '@/lib/onboarding';` line):

```tsx
import { MUNICIPIOS } from '@/constants/Municipios';
```

Add these tests at the end of the file:

```tsx
test('muestra los 28 municipios', async () => {
  await render(<MunicipiosScreen />);
  await waitFor(() => screen.getByText('Zaragoza'));
  expect(MUNICIPIOS.length).toBe(28);
  MUNICIPIOS.forEach((name) => {
    expect(screen.getByText(name)).toBeTruthy();
  });
});

test('los municipios sin cobertura confirmada muestran el aviso de cobertura', async () => {
  await render(<MunicipiosScreen />);
  await waitFor(() => screen.getByText('Zaragoza'));
  expect(
    within(screen.getByTestId('municipio-Zaragoza')).queryByText(
      'Cobertura de estaciones aún no confirmada',
    ),
  ).toBeNull();
  expect(
    within(screen.getByTestId('municipio-Medellín')).getByText(
      'Cobertura de estaciones aún no confirmada',
    ),
  ).toBeTruthy();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest app/onboarding/__tests__/municipios-test.tsx
```

Expected: this file currently fails to even compile (it imports `MUNICIPIOS` which doesn't affect existing tests directly, but the screen it renders still imports the now-removed `PILOT_MUNICIPIOS` from Task 1 until this task's Step 3 fixes the screen) — or, if run before Task 1 is committed, all prior tests fail. Run this after Task 1 is committed: expect the 2 new tests to fail (28 municipios and coverage notice don't exist yet), pre-existing tests should still pass since `PILOT_MUNICIPIOS` doesn't exist anymore and the screen file hasn't been updated yet — expect a compile/import error until Step 3. This is expected; proceed to Step 3.

- [ ] **Step 3: Update the screen**

Replace the imports at the top of `app/onboarding/municipios.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import { useColorScheme } from '@/components/useColorScheme';
import { MUNICIPIOS, tieneCoberturaConfirmada } from '@/constants/Municipios';
import { getSelectedMunicipios, setSelectedMunicipios } from '@/lib/onboarding';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';
```

Replace the municipio-mapping block (the `{PILOT_MUNICIPIOS.map(...)}` block through the closing `</Pressable>` before the `<Button>`) with:

```tsx
      <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
        {MUNICIPIOS.map((name) => {
          const isSelected = selected.includes(name);
          const coberturaConfirmada = tieneCoberturaConfirmada(name);
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
              <View style={styles.rowText}>
                <Text>{name}</Text>
                {!coberturaConfirmada && (
                  <Text style={styles.coverageNotice}>
                    Cobertura de estaciones aún no confirmada
                  </Text>
                )}
              </View>
              <Text>{isSelected ? '✓' : ''}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Button label="Continuar" onPress={handleContinue} />
```

(Everything else in the component — the `Volver` block above this, the closing `</View>` and function body below — stays as-is.)

Replace the `styles` object:

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
  scroll: {
    flex: 1,
  },
  list: {
    gap: Spacing.sm,
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
  rowText: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  coverageNotice: {
    ...Typography.caption,
  },
  volver: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
  },
});
```

Note the `rowText` style's `backgroundColor: 'transparent'` — this is required per the Global Constraints gotcha about Themed `View`'s opaque default; do not omit it.

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest app/onboarding/__tests__/municipios-test.tsx
```

Expected: PASS, 11/11 tests (9 pre-existing + 2 new).

- [ ] **Step 5: Verify lint, typecheck, and formatting**

```bash
npm run lint
npm run typecheck
npx prettier --check "app/onboarding/municipios.tsx" "app/onboarding/__tests__/municipios-test.tsx"
```

Expected: lint 0 errors, typecheck clean (this also confirms Task 1's dangling-import error from its own Step 2 is now resolved), prettier clean.

- [ ] **Step 6: Commit**

```bash
git add app/onboarding/municipios.tsx app/onboarding/__tests__/municipios-test.tsx
git commit -m "Make municipio selector scrollable with coverage notice"
```

---

### Task 3: TerritoryCard coverage notice

**Files:**

- Modify: `components/TerritoryCard.tsx`
- Modify: `components/__tests__/TerritoryCard-test.tsx`

**Interfaces:**

- Produces: `TerritoryCard` gains an optional `coberturaConfirmada?: boolean` prop (default `true`). Consumed by Task 4.

This task is independent of Tasks 1-2 (no import from `constants/Municipios`) — it can run in parallel conceptually, but per this skill's rules, implementer subagents are still dispatched one at a time.

- [ ] **Step 1: Write the failing tests**

Add these tests to the END of `components/__tests__/TerritoryCard-test.tsx`:

```tsx
test('no muestra aviso de cobertura por defecto', async () => {
  await render(<TerritoryCard name="Zaragoza" alertLevel="verde" />);
  expect(
    screen.queryByText('Cobertura de estaciones aún no confirmada'),
  ).toBeNull();
});

test('muestra aviso de cobertura cuando coberturaConfirmada es false', async () => {
  await render(
    <TerritoryCard
      name="Medellín"
      alertLevel="verde"
      coberturaConfirmada={false}
    />,
  );
  expect(
    screen.getByText('Cobertura de estaciones aún no confirmada'),
  ).toBeTruthy();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest components/__tests__/TerritoryCard-test.tsx
```

Expected: the second new test fails (no `coberturaConfirmada` prop exists yet, so the notice never renders). The first new test passes trivially (nothing renders the notice yet regardless). Proceed to implementation.

- [ ] **Step 3: Update the component**

Replace the entire contents of `components/TerritoryCard.tsx`:

```tsx
import { Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from './useColorScheme';
import { Text, View } from './Themed';
import { AlertLevelChip, LEVEL_LABELS } from './AlertLevelChip';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';
import type { AlertLevel } from '@/constants/AlertColors';

type TerritoryCardProps = {
  name: string;
  alertLevel: AlertLevel;
  onPress?: () => void;
  testID?: string;
  coberturaConfirmada?: boolean;
};

export function TerritoryCard({
  name,
  alertLevel,
  onPress,
  testID,
  coberturaConfirmada = true,
}: TerritoryCardProps) {
  const theme = useColorScheme();
  const colors = Colors[theme];

  return (
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
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {!coberturaConfirmada && (
          <Text style={styles.coverageNotice}>
            Cobertura de estaciones aún no confirmada
          </Text>
        )}
      </View>
      <AlertLevelChip level={alertLevel} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  info: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  name: {
    ...Typography.subtitle,
  },
  coverageNotice: {
    ...Typography.caption,
  },
});
```

Note the `info` style's `backgroundColor: 'transparent'` — same Themed-`View`-opacity gotcha as Task 2; do not omit it, or the card's `colors.surface` background will be visually covered by the wrapper.

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest components/__tests__/TerritoryCard-test.tsx
```

Expected: PASS, 4/4 tests (2 pre-existing + 2 new).

- [ ] **Step 5: Verify lint, typecheck, and formatting**

```bash
npm run lint
npm run typecheck
npx prettier --check "components/TerritoryCard.tsx" "components/__tests__/TerritoryCard-test.tsx"
```

Expected: lint 0 errors, typecheck clean, prettier clean.

- [ ] **Step 6: Commit**

```bash
git add components/TerritoryCard.tsx components/__tests__/TerritoryCard-test.tsx
git commit -m "Add coverage notice prop to TerritoryCard"
```

---

### Task 4: Wire coverage state into Inicio

**Files:**

- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/__tests__/index-test.tsx`

**Interfaces:**

- Consumes: `tieneCoberturaConfirmada` from `@/constants/Municipios` (Task 1), `coberturaConfirmada` prop on `TerritoryCard` (Task 3).

- [ ] **Step 1: Write the failing test**

Add this test to the END of `app/(tabs)/__tests__/index-test.tsx`:

```tsx
test('muestra el aviso de cobertura para municipios sin estaciones confirmadas', async () => {
  await AsyncStorage.setItem('onboardingCompleted', 'true');
  await AsyncStorage.setItem(
    'selectedMunicipios',
    JSON.stringify(['Zaragoza', 'Medellín']),
  );
  await render(<InicioScreen />);
  await waitFor(() => screen.getByText('Medellín'));
  expect(
    screen.getByText('Cobertura de estaciones aún no confirmada'),
  ).toBeTruthy();
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest "app/\(tabs\)/__tests__/index-test.tsx"
```

Expected: FAIL — `Inicio` doesn't pass `coberturaConfirmada` to `TerritoryCard` yet, so the notice never renders for Medellín.

- [ ] **Step 3: Update the screen**

In `app/(tabs)/index.tsx`, add an import (near the existing `@/lib/onboarding` import):

```tsx
import { tieneCoberturaConfirmada } from '@/constants/Municipios';
```

Change the `TerritoryCard` render call from:

```tsx
municipios.map((name) => (
  <TerritoryCard key={name} name={name} alertLevel="verde" />
));
```

to:

```tsx
municipios.map((name) => (
  <TerritoryCard
    key={name}
    name={name}
    alertLevel="verde"
    coberturaConfirmada={tieneCoberturaConfirmada(name)}
  />
));
```

Nothing else in the file changes.

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx jest "app/\(tabs\)/__tests__/index-test.tsx"
```

Expected: PASS, 6/6 tests (5 pre-existing + 1 new).

- [ ] **Step 5: Verify lint, typecheck, and formatting**

```bash
npm run lint
npm run typecheck
npx prettier --check "app/(tabs)/index.tsx" "app/(tabs)/__tests__/index-test.tsx"
```

Expected: lint 0 errors, typecheck clean, prettier clean.

- [ ] **Step 6: Commit**

```bash
git add "app/(tabs)/index.tsx" "app/(tabs)/__tests__/index-test.tsx"
git commit -m "Show coverage notice on Inicio for municipios without confirmed stations"
```

---

### Task 5: Full verification

**Files:** none (verification only; may produce fix commits if something fails)

- [ ] **Step 1: Run the full automated chain fresh**

```bash
rm -rf node_modules
npm ci
npm run lint
npm run typecheck
npm run format:check
npx expo-doctor
npm test -- --ci
```

Expected: all exit 0/clean. `npm test` should report 19 test suites (unchanged count) with 62 tests total (57 baseline + 2 from Task 2 + 2 from Task 3 + 1 from Task 4) — read the real number from your own run and sanity-check it against this.

- [ ] **Step 2: Manual/visual check if a simulator is available**

If an iOS simulator or Android emulator is available in this environment, boot it, run `npx expo start --ios` (or `--android`), and navigate to `/onboarding/municipios`. Confirm visually: the list scrolls smoothly through all 28 municipios, the coverage notice appears under the correct municipios (not the 3 pilots), and text is legible. Also check Inicio with a non-pilot municipio selected shows the same notice on its card. If no simulator/synthetic-tap tool is available, state that plainly — do not claim a check you didn't perform.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin municipios-expansion
gh pr create --title "Expand municipio list with explicit coverage notice" --body "Implements docs/specs/2026-07-24-municipios-expansion.md. Prerequisite for E5-02/E3-01/E6-01, which all depend on the municipio list. Expands from 3 pilot municipios to 28 (Valle de Aburrá + 15 most populated in Antioquia, DANE population data, confirmed with the user), with an explicit 'cobertura de estaciones aún no confirmada' notice for the 25 without real SAMA stations — shown both at selection time and on the Inicio screen." --base main
gh pr checks --watch
```

Expected: PR opens against `main`, CI passes. Do not merge — leave it open for human review.
