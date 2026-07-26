# Directorio de Emergencia (E5-02) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an emergency directory section (CMGRD, Bomberos, Defensa Civil per municipio) to the bottom of the "¿Qué hago?" screen, scoped to the user's selected municipios, with call buttons that are disabled and show "Número pendiente de verificación" until real phone numbers exist.

**Architecture:** `constants/Directorio.ts` derives a `DIRECTORIO` map programmatically from the existing `MUNICIPIOS` list (28 municipios × 3 entities, all `telefono: null` today). `app/(tabs)/que-hago.tsx` gains a new section below the existing recommendations content, wrapped together with the rest of the screen in a `ScrollView` (the screen no longer fits without scrolling). The section reads the user's selected municipios via `getSelectedMunicipios` + `useFocusEffect`, same pattern as `app/(tabs)/index.tsx`.

**Tech Stack:** Same as prior plans (Expo Router, TypeScript strict, Jest + `jest-expo`, `@testing-library/react-native`). `Linking` is part of `react-native`, no new dependency.

## Global Constraints

- Branch `directorio-emergencia`, branched from `main`.
- No new dependencies. No color/token changes.
- Do not modify `app/_layout.tsx`, `app/alerta/[id].tsx`, or any screen other than `app/(tabs)/que-hago.tsx`.
- UI copy in Spanish; code identifiers in English. TypeScript strict; no `any`.
- No real phone numbers — every entry in `constants/Directorio.ts` has `telefono: null`.
- Keep the existing E5-01 recommendations content (event/phase selectors) working exactly as before; this plan only adds a new section below it.
- Keep accessibility conventions from E1-05 (`accessibilityRole`, `accessibilityState`, `minHeight: 44`) on everything new.
- **Gotcha hand-verified in this exact repo, must be applied exactly as shown:** when testing `Linking.openURL` across multiple `test()` blocks in the same file, use `Linking.openURL = jest.fn().mockResolvedValue(undefined);` in `beforeEach` — **not** `jest.spyOn(Linking, 'openURL').mockResolvedValue()`. React Native's Jest preset already auto-mocks `Linking.openURL` as a `jest.fn()`; wrapping it again with `jest.spyOn` (even combined with `jest.restoreAllMocks()` in `afterEach`) was confirmed to leak call history between tests in this repo — a "was disabled, should not call" test observed a call from the _previous_ test's enabled-button press. Directly reassigning `Linking.openURL` to a brand-new `jest.fn()` each `beforeEach` was verified to fix this cleanly.
- Every verification step must actually be run and its real output checked — never mark a step done because it "should" pass.

---

### Task 1: Directory data file

**Files:**

- Create: `constants/Directorio.ts`

**Interfaces:**

- Produces: `EntidadId` (`'cmgrd' | 'bomberos' | 'defensa_civil'`), `EntidadDirectorio` (`{ id: EntidadId; label: string; telefono: string | null }`), `DIRECTORIO: Record<string, EntidadDirectorio[]>` — keyed by every municipio in `MUNICIPIOS` (from `@/constants/Municipios`, already on `main`), each with the 3 entities and `telefono: null`. Consumed by Task 2's screen.

This task has no tests of its own (static-shaped data derived from existing `MUNICIPIOS`, exercised indirectly through Task 2's screen tests) — just create the file and verify it typechecks.

- [ ] **Step 1: Create the data file**

```ts
import { MUNICIPIOS } from './Municipios';

export type EntidadId = 'cmgrd' | 'bomberos' | 'defensa_civil';

export type EntidadDirectorio = {
  id: EntidadId;
  label: string;
  telefono: string | null;
};

const ENTIDADES: { id: EntidadId; label: string }[] = [
  { id: 'cmgrd', label: 'CMGRD' },
  { id: 'bomberos', label: 'Bomberos' },
  { id: 'defensa_civil', label: 'Defensa Civil' },
];

export const DIRECTORIO: Record<string, EntidadDirectorio[]> =
  Object.fromEntries(
    MUNICIPIOS.map((municipio) => [
      municipio,
      ENTIDADES.map((entidad) => ({ ...entidad, telefono: null })),
    ]),
  );
```

- [ ] **Step 2: Verify it typechecks**

```bash
npm run typecheck
```

Expected: exit 0, no errors.

- [ ] **Step 3: Verify formatting**

```bash
npx prettier --check constants/Directorio.ts
```

Expected: "All matched files use Prettier code style!"

- [ ] **Step 4: Commit**

```bash
git add constants/Directorio.ts
git commit -m "Add emergency directory data derived from municipios list"
```

---

### Task 2: Directory section on the que-hago screen

**Files:**

- Modify: `app/(tabs)/que-hago.tsx`
- Modify: `app/(tabs)/__tests__/que-hago-test.tsx`

**Interfaces:**

- Consumes: `DIRECTORIO` from `@/constants/Directorio` (Task 1), `getSelectedMunicipios` from `@/lib/onboarding` (already exists, used by `app/(tabs)/index.tsx`).

- [ ] **Step 1: Write the failing tests**

Add `jest.mock` calls and an `AsyncStorage` import at the very top of `app/(tabs)/__tests__/que-hago-test.tsx`, before the existing imports, and a `beforeEach`:

```tsx
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-router', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (cb: () => void) => useEffect(cb, []),
  };
});
```

Then, in the existing import block, add:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
```

(keep the existing `import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';` and `import QueHagoScreen from '../que-hago';` lines as they are)

Add this right after the imports, before the first `test(...)`:

```tsx
beforeEach(async () => {
  await AsyncStorage.clear();
});
```

Add these tests to the END of the file:

```tsx
test('el directorio tiene accessibilityRole header', async () => {
  await render(<QueHagoScreen />);
  const header = screen.getByRole('header', {
    name: 'Directorio de emergencia',
  });
  expect(header).toBeTruthy();
});

test('sin municipios seleccionados, muestra un mensaje en vez del directorio', async () => {
  await render(<QueHagoScreen />);
  await waitFor(() =>
    expect(
      screen.getByText('Aún no has añadido ningún municipio.'),
    ).toBeTruthy(),
  );
});

test('con municipios seleccionados, muestra sus 3 entidades con teléfono pendiente', async () => {
  await AsyncStorage.setItem(
    'selectedMunicipios',
    JSON.stringify(['Zaragoza']),
  );
  await render(<QueHagoScreen />);
  await waitFor(() => screen.getByText('Zaragoza'));
  expect(screen.getByText('CMGRD')).toBeTruthy();
  expect(screen.getByText('Bomberos')).toBeTruthy();
  expect(screen.getByText('Defensa Civil')).toBeTruthy();
  const boton = screen.getByTestId('llamar-Zaragoza-cmgrd');
  expect(boton.props.accessibilityState).toEqual({ disabled: true });
  const botonStyle = Object.assign({}, ...boton.props.style);
  expect(botonStyle.minHeight).toBe(44);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest "app/\(tabs\)/__tests__/que-hago-test.tsx"
```

Expected: the 3 new tests fail (no directory section exists yet). All pre-existing tests should still pass — they don't depend on `AsyncStorage`/`expo-router`, so adding those mocks shouldn't break them; if any pre-existing test unexpectedly fails here, stop and investigate before proceeding.

- [ ] **Step 3: Update the screen**

Replace the imports at the top of `app/(tabs)/que-hago.tsx`:

```tsx
import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';
import {
  CONTENIDO,
  EVENTOS,
  FASES,
  type EventoId,
  type Fase,
} from '@/constants/QueHago';
import { DIRECTORIO } from '@/constants/Directorio';
import { getSelectedMunicipios } from '@/lib/onboarding';
```

Replace the entire component body (everything from `export default function QueHagoScreen()` through its closing `}`) with:

```tsx
export default function QueHagoScreen() {
  const [evento, setEvento] = useState<EventoId>(EVENTOS[0].id);
  const [fase, setFase] = useState<Fase>(FASES[0].id);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const theme = useColorScheme();
  const colors = Colors[theme];

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getSelectedMunicipios().then((selected) => {
        if (!cancelled) setMunicipios(selected);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title} accessibilityRole="header">
          ¿Qué hago?
        </Text>
        <View style={styles.selectorRow}>
          {EVENTOS.map((item) => {
            const isSelected = item.id === evento;
            return (
              <Pressable
                key={item.id}
                testID={`evento-${item.id}`}
                onPress={() => setEvento(item.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.tab,
                  {
                    borderColor: isSelected ? colors.tint : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    backgroundColor: isSelected
                      ? colors.surface
                      : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    isSelected && { color: colors.tint, fontWeight: '700' },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.selectorRow}>
          {FASES.map((item) => {
            const isSelected = item.id === fase;
            return (
              <Pressable
                key={item.id}
                testID={`fase-${item.id}`}
                onPress={() => setFase(item.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.tab,
                  {
                    borderColor: isSelected ? colors.tint : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    backgroundColor: isSelected
                      ? colors.surface
                      : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    isSelected && { color: colors.tint, fontWeight: '700' },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.content}>
          {CONTENIDO[evento][fase].map((item, index) => (
            <Text key={index} style={styles.contentItem}>
              {item}
            </Text>
          ))}
        </View>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Directorio de emergencia
        </Text>
        {municipios.length === 0 ? (
          <Text>Aún no has añadido ningún municipio.</Text>
        ) : (
          municipios.map((municipio) => (
            <View key={municipio} style={styles.municipioBlock}>
              <Text style={styles.municipioTitle}>{municipio}</Text>
              {DIRECTORIO[municipio].map((entidad) => (
                <View key={entidad.id} style={styles.entidadRow}>
                  <Text style={styles.entidadLabel}>{entidad.label}</Text>
                  <Pressable
                    testID={`llamar-${municipio}-${entidad.id}`}
                    disabled={!entidad.telefono}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !entidad.telefono }}
                    accessibilityLabel={
                      entidad.telefono
                        ? `Llamar a ${entidad.label}, ${entidad.telefono}`
                        : `${entidad.label}, número pendiente de verificación`
                    }
                    onPress={
                      entidad.telefono
                        ? () => Linking.openURL(`tel:${entidad.telefono}`)
                        : undefined
                    }
                    style={[
                      styles.callButton,
                      {
                        borderColor: colors.border,
                        opacity: entidad.telefono ? 1 : 0.5,
                      },
                    ]}
                  >
                    <Text style={styles.callButtonLabel}>
                      {entidad.telefono ?? 'Número pendiente de verificación'}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
```

Replace the `styles` object:

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    ...Typography.title,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: Spacing.xs,
  },
  tabLabel: {
    ...Typography.caption,
    textAlign: 'center',
  },
  content: {
    gap: Spacing.sm,
  },
  contentItem: {
    ...Typography.body,
  },
  sectionTitle: {
    ...Typography.subtitle,
  },
  municipioBlock: {
    gap: Spacing.sm,
  },
  municipioTitle: {
    ...Typography.subtitle,
  },
  entidadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  entidadLabel: {
    ...Typography.body,
  },
  callButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: 8,
  },
  callButtonLabel: {
    ...Typography.caption,
  },
});
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest "app/\(tabs\)/__tests__/que-hago-test.tsx"
```

Expected: PASS, 10/10 tests (7 pre-existing + 3 new).

- [ ] **Step 5: Verify lint, typecheck, and formatting**

```bash
npm run lint
npm run typecheck
npx prettier --check "app/(tabs)/que-hago.tsx" "app/(tabs)/__tests__/que-hago-test.tsx"
```

Expected: lint 0 errors, typecheck clean, prettier clean.

- [ ] **Step 6: Commit**

```bash
git add "app/(tabs)/que-hago.tsx" "app/(tabs)/__tests__/que-hago-test.tsx"
git commit -m "Add emergency directory section to que-hago screen"
```

---

### Task 3: Call button behavior with a real phone number

**Files:**

- Create: `app/(tabs)/__tests__/que-hago-directorio-test.tsx`

**Interfaces:**

- Consumes: `QueHagoScreen` from `../que-hago` (Task 2). Mocks `@/constants/Directorio` entirely for this file only, since production data has no real phone numbers yet (every entry is `null`) — this file needs a controlled fixture with one real number to exercise CA6.

This is a separate test file (not added to `que-hago-test.tsx`) so its module-level mock of `@/constants/Directorio` doesn't affect the other tests in Task 2, which intentionally exercise the real, unmocked directory data.

- [ ] **Step 1: Write the failing tests**

Create `app/(tabs)/__tests__/que-hago-directorio-test.tsx`:

```tsx
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-router', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (cb: () => void) => useEffect(cb, []),
  };
});

jest.mock('@/constants/Directorio', () => ({
  DIRECTORIO: {
    Zaragoza: [
      { id: 'cmgrd', label: 'CMGRD', telefono: '3001234567' },
      { id: 'bomberos', label: 'Bomberos', telefono: null },
      { id: 'defensa_civil', label: 'Defensa Civil', telefono: null },
    ],
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import QueHagoScreen from '../que-hago';

beforeEach(async () => {
  await AsyncStorage.clear();
  Linking.openURL = jest.fn().mockResolvedValue(undefined);
});

test('con teléfono real, el botón de llamada está habilitado y llama', async () => {
  await AsyncStorage.setItem(
    'selectedMunicipios',
    JSON.stringify(['Zaragoza']),
  );
  await render(<QueHagoScreen />);
  await waitFor(() => screen.getByText('CMGRD'));
  const boton = screen.getByTestId('llamar-Zaragoza-cmgrd');
  expect(boton.props.accessibilityState).toEqual({ disabled: false });
  fireEvent.press(boton);
  expect(Linking.openURL).toHaveBeenCalledWith('tel:3001234567');
});

test('con teléfono pendiente, el botón de llamada no llama al presionarlo', async () => {
  await AsyncStorage.setItem(
    'selectedMunicipios',
    JSON.stringify(['Zaragoza']),
  );
  await render(<QueHagoScreen />);
  await waitFor(() => screen.getByText('Bomberos'));
  const boton = screen.getByTestId('llamar-Zaragoza-bomberos');
  fireEvent.press(boton);
  expect(Linking.openURL).not.toHaveBeenCalled();
});
```

Note the Global Constraints gotcha: `Linking.openURL = jest.fn().mockResolvedValue(undefined);` — do not change this to `jest.spyOn`.

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest "app/\(tabs\)/__tests__/que-hago-directorio-test.tsx"
```

Expected: FAIL — both tests fail because Task 2's screen implementation isn't wired to check `entidad.telefono` correctly yet from THIS file's perspective (actually, if Task 2 is already committed by the time this task runs, the screen code already exists and is correct — in that case these tests should PASS immediately on the first run since Task 2 already implemented the exact behavior this task tests). If they pass immediately, that's expected given Task 2 precedes this task — treat this step as a confirmation run rather than a strict RED step, and note that in your report instead of forcing an artificial failure.

- [ ] **Step 3: Run lint, typecheck, and formatting**

```bash
npm run lint
npm run typecheck
npx prettier --check "app/(tabs)/__tests__/que-hago-directorio-test.tsx"
```

Expected: lint 0 errors, typecheck clean, prettier clean.

- [ ] **Step 4: Commit**

```bash
git add "app/(tabs)/__tests__/que-hago-directorio-test.tsx"
git commit -m "Add tests for call button behavior with a real phone number"
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
npx expo-doctor
npm test -- --ci
```

Expected: all exit 0/clean. `npm test` should report 20 test suites (19 baseline + 1 new file from Task 3) with 67 tests total (62 baseline + 3 from Task 2 + 2 from Task 3) — read the real number from your own run and sanity-check it against this.

- [ ] **Step 2: Manual/visual check if a simulator is available**

If an iOS simulator or Android emulator is available in this environment, boot it, run `npx expo start --ios` (or `--android`), select at least one municipio in onboarding, and navigate to the "¿Qué hago?" tab. Confirm visually: the screen scrolls through recommendations into the directory section, the selected municipio's 3 entities render with a visibly dimmed/disabled call button showing "Número pendiente de verificación". If no simulator/synthetic-tap tool is available, state that plainly — do not claim a check you didn't perform.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin directorio-emergencia
gh pr create --title "Add emergency directory to que-hago screen (E5-02)" --body "Implements docs/specs/2026-07-24-directorio-emergencia.md (E5-02). All phone numbers are null/placeholder — no public confirmable source was found even for the existing pilot municipios (see the spec's Conversación section). Call buttons are disabled with 'Número pendiente de verificación' until Dagran confirms real numbers, to avoid a non-functional emergency call button in a real disaster-alert app." --base main
gh pr checks --watch
```

Expected: PR opens against `main`, CI passes. Do not merge — leave it open for human review.
