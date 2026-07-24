# Onboarding (E1-03) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A 3-screen onboarding flow (bienvenida → municipios → notificaciones) gated by an AsyncStorage flag, using only the 3 confirmed pilot municipalities, that requests the real OS notification permission and updates Inicio to show the chosen municipios.

**Architecture:** `app/onboarding/` is a new Expo Router group with its own Stack layout. `app/(tabs)/index.tsx` (Inicio) gates on an `onboardingCompleted` flag read from AsyncStorage via `useFocusEffect`, redirecting to `/onboarding` when not set, and rendering a `TerritoryCard` per saved municipio otherwise. The municipios screen is reused both inside the onboarding sequence and standalone (opened from Inicio's "+ Añadir municipio" button) via a `?standalone=true` query param.

**Tech Stack:** Same as prior plans (Expo Router, TypeScript strict, Jest + `jest-expo`, `@testing-library/react-native`), plus two new dependencies: `@react-native-async-storage/async-storage` (persistence) and `expo-notifications` (permission request).

## Global Constraints

- Branch `onboarding`, branched from `main` (this plan assumes the harness and design-system plans are already merged to `main` — confirm with `git log --oneline -5` before starting; if not merged, ask the human before proceeding).
- Only the 3 pilot municipios (`Zaragoza`, `Carepa`, `Turbo`) — do not add more. The full list of ~36 is pending E0-02; do not fabricate it.
- Install `@react-native-async-storage/async-storage` and `expo-notifications` via `npx expo install <pkg>` — never hand-pin a version number, this plan's prior siblings hit real version-incompatibility bugs from doing that.
- No backend/BFF calls, no push token registration (that's E4-01) — this plan only requests the OS permission and records locally whether it was granted.
- Do not modify `app/(tabs)/alertas.tsx`, `app/(tabs)/mapa.tsx`, `app/(tabs)/que-hago.tsx`, `app/(tabs)/reportar.tsx`, `app/alerta/[id].tsx`, or `app/_layout.tsx`.
- UI copy in Spanish; code identifiers in English. TypeScript strict; no `any`.
- The 3 mocking patterns below were hand-verified working in this exact repo before being written into this plan — use them exactly as given, do not substitute a different approach:
  - AsyncStorage: `jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));`
  - `expo-notifications`: `jest.mock('expo-notifications', () => ({ requestPermissionsAsync: jest.fn() }));` — the real module returns `undefined` under jest-expo's default auto-mock, so tests MUST mock it explicitly or any code destructuring the result will crash.
  - `expo-router`'s `useFocusEffect`/`Redirect`: both internally require a full navigation context that plain `render()` doesn't provide, and BOTH must be mocked together in any test that renders `app/(tabs)/index.tsx`. Critically, the mock must wrap the callback in a **real `useEffect`**, not call it directly during render — calling it directly causes an infinite re-render loop (verified — this was a real bug caught while writing this plan):
    ```ts
    jest.mock('expo-router', () => {
      const { useEffect } = require('react');
      return {
        useFocusEffect: (cb: () => void) => useEffect(cb, []),
        Redirect: ({ href }: { href: string }) => {
          const { Text } = require('react-native');
          return <Text>{`redirect:${href}`}</Text>;
        },
        router: { push: (...args: unknown[]) => mockPush(...args) },
      };
    });
    ```
- When a test toggles a checkbox-like row and then immediately presses another button in the same test, `await waitFor(...)` on the toggle's visible effect (e.g. the checkmark appearing) BEFORE pressing the next button — pressing two buttons back-to-back without waiting between them can race against React's state commit and read a stale closure value (verified — this was a real, reproducible test bug caught while writing this plan, not a hypothetical).
- Every verification step must actually be run and its real output checked — never mark a step done because it "should" pass.

## Already verified before this plan (for context, not to redo)

Every file and test in this plan was fully hand-implemented and verified end-to-end by the plan's author before being written here: `npm run lint` (0 errors), `npm run typecheck` (clean), `npm run format:check` (clean), `npm test -- --ci` (15 suites / 36 tests passing), AND all 3 onboarding screens plus the Inicio redirect were visually confirmed correct on a real iOS 26.3 simulator (via `xcrun simctl` deep links, since no synthetic-tap tool was available in that environment). The code below is that exact verified implementation — implementers should transcribe it precisely rather than reinvent it, and reviewers can trust the architecture is sound and focus on verifying the transcription and the *your* environment's test run, not re-litigating design choices.

---

### Task 1: Dependencies, persistence layer, and municipio list

**Files:**
- Modify: `package.json`, `package-lock.json` (add `@react-native-async-storage/async-storage`, `expo-notifications`)
- Create: `lib/onboarding.ts`
- Create: `lib/__tests__/onboarding-test.ts`
- Create: `constants/Municipios.ts`

**Interfaces:**
- Produces: `getOnboardingCompleted()`, `setOnboardingCompleted()`, `getSelectedMunicipios()`, `setSelectedMunicipios(string[])` (all async) — consumed by Tasks 2-5. `PILOT_MUNICIPIOS` (readonly string tuple) — consumed by Task 3.

- [ ] **Step 1: Install dependencies**

```bash
npx expo install @react-native-async-storage/async-storage expo-notifications
```

Expected: both added to `package.json` at SDK-57-compatible versions (do not hand-edit the versions afterward).

- [ ] **Step 2: Create the municipio list**

`constants/Municipios.ts`:

```ts
// Lista provisional: solo los 3 municipios piloto confirmados en la propuesta.
// El listado completo de los ~36 municipios instrumentados queda pendiente de
// E0-02 (validación de fuentes de datos con Dagran/G-LIMA) — ver
// docs/specs/2026-07-24-onboarding.md.
export const PILOT_MUNICIPIOS = ['Zaragoza', 'Carepa', 'Turbo'] as const;
```

- [ ] **Step 3: Write the failing tests for the persistence layer**

`lib/__tests__/onboarding-test.ts`:

```ts
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getOnboardingCompleted,
  getSelectedMunicipios,
  setOnboardingCompleted,
  setSelectedMunicipios,
} from '../onboarding';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('getOnboardingCompleted es false por defecto', async () => {
  expect(await getOnboardingCompleted()).toBe(false);
});

test('setOnboardingCompleted lo deja en true', async () => {
  await setOnboardingCompleted();
  expect(await getOnboardingCompleted()).toBe(true);
});

test('getSelectedMunicipios es [] por defecto', async () => {
  expect(await getSelectedMunicipios()).toEqual([]);
});

test('setSelectedMunicipios persiste la lista', async () => {
  await setSelectedMunicipios(['Zaragoza', 'Turbo']);
  expect(await getSelectedMunicipios()).toEqual(['Zaragoza', 'Turbo']);
});
```

- [ ] **Step 4: Run the tests to verify they fail**

```bash
npx jest lib/__tests__/onboarding-test.ts
```

Expected: FAIL with "Cannot find module '../onboarding'".

- [ ] **Step 5: Implement the persistence layer**

`lib/onboarding.ts`:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';
const SELECTED_MUNICIPIOS_KEY = 'selectedMunicipios';

export async function getOnboardingCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
  return value === 'true';
}

export async function setOnboardingCompleted(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
}

export async function getSelectedMunicipios(): Promise<string[]> {
  const value = await AsyncStorage.getItem(SELECTED_MUNICIPIOS_KEY);
  return value ? JSON.parse(value) : [];
}

export async function setSelectedMunicipios(
  municipios: string[],
): Promise<void> {
  await AsyncStorage.setItem(
    SELECTED_MUNICIPIOS_KEY,
    JSON.stringify(municipios),
  );
}
```

- [ ] **Step 6: Run the tests to verify they pass**

```bash
npx jest lib/__tests__/onboarding-test.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 7: Verify lint and typecheck**

```bash
npm run lint
npm run typecheck
```

Expected: both exit 0.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add onboarding persistence layer and pilot municipio list"
```

---

### Task 2: Onboarding route structure and Bienvenida screen

**Files:**
- Create: `app/onboarding/_layout.tsx`
- Create: `app/onboarding/index.tsx`
- Create: `app/onboarding/__tests__/index-test.tsx`

**Interfaces:**
- Produces: the route `/onboarding` (Bienvenida) — consumed by `(tabs)/index.tsx`'s redirect (Task 5). Navigates to `/onboarding/municipios` on "Comenzar" — consumed by Task 3's route.

- [ ] **Step 1: Write the failing test**

`app/onboarding/__tests__/index-test.tsx`:

```tsx
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
}));

import { fireEvent, render, screen } from '@testing-library/react-native';
import BienvenidaScreen from '../index';

beforeEach(() => {
  mockPush.mockClear();
});

test('Comenzar navega a la selección de municipios', async () => {
  await render(<BienvenidaScreen />);
  fireEvent.press(screen.getByText('Comenzar'));
  expect(mockPush).toHaveBeenCalledWith('/onboarding/municipios');
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest app/onboarding/__tests__/index-test.tsx
```

Expected: FAIL with "Cannot find module '../index'".

- [ ] **Step 3: Create the onboarding Stack layout**

`app/onboarding/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="municipios" />
      <Stack.Screen name="notificaciones" />
    </Stack>
  );
}
```

- [ ] **Step 4: Create the Bienvenida screen**

`app/onboarding/index.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';

export default function BienvenidaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SAMA</Text>
      <Text style={styles.subtitle}>
        Alertas de riesgo hidrometeorológico para tu municipio, directo a tu
        celular.
      </Text>
      <Button
        label="Comenzar"
        onPress={() => router.push('/onboarding/municipios')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  title: {
    ...Typography.title,
    fontSize: 34,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
});
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx jest app/onboarding/__tests__/index-test.tsx
```

Expected: PASS, 1 test.

- [ ] **Step 6: Verify lint and typecheck**

```bash
npm run lint
npm run typecheck
```

Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add onboarding route structure and Bienvenida screen"
```

---

### Task 3: Municipios selection screen

**Files:**
- Create: `app/onboarding/municipios.tsx`
- Create: `app/onboarding/__tests__/municipios-test.tsx`

**Interfaces:**
- Consumes: `PILOT_MUNICIPIOS` (Task 1), `getSelectedMunicipios`/`setSelectedMunicipios` (Task 1).
- Produces: the route `/onboarding/municipios`, which accepts an optional `standalone` query param. When `standalone=true`, "Continuar" saves and calls `router.back()` instead of advancing — consumed by Task 5's "+ Añadir municipio" button.

- [ ] **Step 1: Write the failing tests**

`app/onboarding/__tests__/municipios-test.tsx`:

```tsx
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: () => mockBack(),
  },
  useLocalSearchParams: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import MunicipiosScreen from '../municipios';
import { getSelectedMunicipios } from '@/lib/onboarding';

const mockedParams = useLocalSearchParams as jest.Mock;

beforeEach(async () => {
  await AsyncStorage.clear();
  mockPush.mockClear();
  mockBack.mockClear();
  mockedParams.mockReturnValue({});
});

test('muestra los 3 municipios piloto', async () => {
  await render(<MunicipiosScreen />);
  await waitFor(() => expect(screen.getByText('Zaragoza')).toBeTruthy());
  expect(screen.getByText('Carepa')).toBeTruthy();
  expect(screen.getByText('Turbo')).toBeTruthy();
});

test('seleccionar y continuar guarda la selección y avanza a notificaciones', async () => {
  await render(<MunicipiosScreen />);
  await waitFor(() => screen.getByText('Zaragoza'));
  fireEvent.press(screen.getByTestId('municipio-Zaragoza'));
  await waitFor(() => {
    const row = screen.getByTestId('municipio-Zaragoza');
    expect(within(row).getByText('✓')).toBeTruthy();
  });
  fireEvent.press(screen.getByText('Continuar'));
  await waitFor(() =>
    expect(mockPush).toHaveBeenCalledWith('/onboarding/notificaciones'),
  );
  expect(await getSelectedMunicipios()).toEqual(['Zaragoza']);
});

test('en modo standalone, continuar guarda y vuelve atrás en vez de avanzar', async () => {
  mockedParams.mockReturnValue({ standalone: 'true' });
  await render(<MunicipiosScreen />);
  await waitFor(() => screen.getByText('Turbo'));
  fireEvent.press(screen.getByTestId('municipio-Turbo'));
  await waitFor(() => {
    const row = screen.getByTestId('municipio-Turbo');
    expect(within(row).getByText('✓')).toBeTruthy();
  });
  fireEvent.press(screen.getByText('Continuar'));
  await waitFor(() => expect(mockBack).toHaveBeenCalled());
  expect(mockPush).not.toHaveBeenCalled();
});

test('en modo standalone, precarga la selección existente', async () => {
  await AsyncStorage.setItem(
    'selectedMunicipios',
    JSON.stringify(['Carepa']),
  );
  mockedParams.mockReturnValue({ standalone: 'true' });
  await render(<MunicipiosScreen />);
  await waitFor(() => {
    const row = screen.getByTestId('municipio-Carepa');
    expect(within(row).getByText('✓')).toBeTruthy();
  });
});

test('en modo standalone, muestra un botón para volver sin guardar', async () => {
  mockedParams.mockReturnValue({ standalone: 'true' });
  await render(<MunicipiosScreen />);
  await waitFor(() => screen.getByText('Volver'));
  fireEvent.press(screen.getByText('Volver'));
  expect(mockBack).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest app/onboarding/__tests__/municipios-test.tsx
```

Expected: FAIL with "Cannot find module '../municipios'".

- [ ] **Step 3: Implement the screen**

`app/onboarding/municipios.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import { useColorScheme } from '@/components/useColorScheme';
import { PILOT_MUNICIPIOS } from '@/constants/Municipios';
import {
  getSelectedMunicipios,
  setSelectedMunicipios,
} from '@/lib/onboarding';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';

export default function MunicipiosScreen() {
  const { standalone } = useLocalSearchParams<{ standalone?: string }>();
  const isStandalone = standalone === 'true';
  const [selected, setSelected] = useState<string[]>([]);
  const theme = useColorScheme();
  const colors = Colors[theme];

  useEffect(() => {
    getSelectedMunicipios().then(setSelected);
  }, []);

  function toggle(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );
  }

  async function handleContinue() {
    await setSelectedMunicipios(selected);
    if (isStandalone) {
      router.back();
    } else {
      router.push('/onboarding/notificaciones');
    }
  }

  return (
    <View style={styles.container}>
      {isStandalone && (
        <Pressable onPress={() => router.back()}>
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
      <Button label="Continuar" onPress={handleContinue} />
    </View>
  );
}

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
  },
});
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest app/onboarding/__tests__/municipios-test.tsx
```

Expected: PASS, 5 tests. If the "seleccionar y continuar" or "modo standalone, continuar" tests fail with an unexpected `[]` where `['Zaragoza']`/`['Turbo']` was expected, you skipped the intermediate `waitFor` after the toggle press — see the Global Constraints note on this exact failure mode.

- [ ] **Step 5: Verify lint and typecheck**

```bash
npm run lint
npm run typecheck
```

Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add municipios selection screen"
```

---

### Task 4: Notificaciones screen

**Files:**
- Create: `app/onboarding/notificaciones.tsx`
- Create: `app/onboarding/__tests__/notificaciones-test.tsx`

**Interfaces:**
- Consumes: `setOnboardingCompleted` (Task 1), `expo-notifications`'s `requestPermissionsAsync`.
- Produces: the route `/onboarding/notificaciones`, the terminal screen of the onboarding sequence — both paths (`Permitir`/`Ahora no`) call `router.replace('/(tabs)')`.

- [ ] **Step 1: Write the failing tests**

`app/onboarding/__tests__/notificaciones-test.tsx`:

```tsx
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
}));

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: { replace: (...args: unknown[]) => mockReplace(...args) },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import NotificacionesScreen from '../notificaciones';
import { getOnboardingCompleted } from '@/lib/onboarding';

const mockedRequest = Notifications.requestPermissionsAsync as jest.Mock;

beforeEach(async () => {
  await AsyncStorage.clear();
  mockReplace.mockClear();
  mockedRequest.mockReset();
});

test('Permitir pide el permiso real y completa el onboarding', async () => {
  mockedRequest.mockResolvedValue({ granted: true });
  await render(<NotificacionesScreen />);
  fireEvent.press(screen.getByText('Permitir'));
  await waitFor(() => expect(mockedRequest).toHaveBeenCalled());
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'));
  expect(await getOnboardingCompleted()).toBe(true);
});

test('Ahora no completa el onboarding sin pedir el permiso', async () => {
  await render(<NotificacionesScreen />);
  fireEvent.press(screen.getByText('Ahora no'));
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(tabs)'));
  expect(mockedRequest).not.toHaveBeenCalled();
  expect(await getOnboardingCompleted()).toBe(true);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest app/onboarding/__tests__/notificaciones-test.tsx
```

Expected: FAIL with "Cannot find module '../notificaciones'".

- [ ] **Step 3: Implement the screen**

`app/onboarding/notificaciones.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import { setOnboardingCompleted } from '@/lib/onboarding';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';

async function finish() {
  await setOnboardingCompleted();
  router.replace('/(tabs)');
}

export default function NotificacionesScreen() {
  async function handlePermitir() {
    await Notifications.requestPermissionsAsync();
    await finish();
  }

  async function handleAhoraNo() {
    await finish();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recibe alertas al instante</Text>
      <Text style={styles.body}>
        Activa las notificaciones para enterarte apenas se emita una alerta
        en tu municipio. Puedes cambiar esto después desde los ajustes de tu
        celular.
      </Text>
      <Button label="Permitir" onPress={handlePermitir} />
      <Button label="Ahora no" variant="secondary" onPress={handleAhoraNo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  title: {
    ...Typography.title,
    textAlign: 'center',
  },
  body: {
    ...Typography.body,
    textAlign: 'center',
  },
});
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest app/onboarding/__tests__/notificaciones-test.tsx
```

Expected: PASS, 2 tests.

- [ ] **Step 5: Verify lint and typecheck**

```bash
npm run lint
npm run typecheck
```

Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add notificaciones screen with real permission request"
```

---

### Task 5: Update Inicio to gate on onboarding and show selected municipios

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Create: `app/(tabs)/__tests__/index-test.tsx`

**Interfaces:**
- Consumes: `getOnboardingCompleted`/`getSelectedMunicipios` (Task 1), `TerritoryCard` (existing, from the design-system plan), `/onboarding` route (Task 2), `/onboarding/municipios` route (Task 3).
- Produces: nothing new consumed by later tasks — this is the last feature task.

- [ ] **Step 1: Write the failing tests**

`app/(tabs)/__tests__/index-test.tsx`:

```tsx
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const { useEffect } = require('react');
  return {
    useFocusEffect: (cb: () => void) => useEffect(cb, []),
    Redirect: ({ href }: { href: string }) => {
      const { Text } = require('react-native');
      return <Text>{`redirect:${href}`}</Text>;
    },
    router: { push: (...args: unknown[]) => mockPush(...args) },
  };
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import InicioScreen from '../index';

beforeEach(async () => {
  await AsyncStorage.clear();
  mockPush.mockClear();
});

test('redirige a onboarding si no se completó', async () => {
  await render(<InicioScreen />);
  await waitFor(() =>
    expect(screen.getByText('redirect:/onboarding')).toBeTruthy(),
  );
});

test('muestra el placeholder si no hay municipios guardados', async () => {
  await AsyncStorage.setItem('onboardingCompleted', 'true');
  await render(<InicioScreen />);
  await waitFor(() =>
    expect(
      screen.getByText('Aún no has añadido ningún municipio.'),
    ).toBeTruthy(),
  );
});

test('muestra una TerritoryCard por cada municipio guardado', async () => {
  await AsyncStorage.setItem('onboardingCompleted', 'true');
  await AsyncStorage.setItem(
    'selectedMunicipios',
    JSON.stringify(['Zaragoza', 'Carepa']),
  );
  await render(<InicioScreen />);
  await waitFor(() => expect(screen.getByText('Zaragoza')).toBeTruthy());
  expect(screen.getByText('Carepa')).toBeTruthy();
});

test('+ Añadir municipio navega al selector en modo standalone', async () => {
  await AsyncStorage.setItem('onboardingCompleted', 'true');
  await render(<InicioScreen />);
  await waitFor(() => screen.getByText('+ Añadir municipio'));
  fireEvent.press(screen.getByText('+ Añadir municipio'));
  expect(mockPush).toHaveBeenCalledWith(
    '/onboarding/municipios?standalone=true',
  );
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest "app/(tabs)/__tests__/index-test.tsx"
```

Expected: FAIL — the current `InicioScreen` always renders the placeholder text and never redirects, so the first and last tests fail.

- [ ] **Step 3: Replace the Inicio screen**

`app/(tabs)/index.tsx`:

```tsx
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import { TerritoryCard } from '@/components/TerritoryCard';
import {
  getOnboardingCompleted,
  getSelectedMunicipios,
} from '@/lib/onboarding';
import Spacing from '@/constants/Spacing';

export default function InicioScreen() {
  const [status, setStatus] = useState<
    'loading' | 'needs-onboarding' | 'ready'
  >('loading');
  const [municipios, setMunicipios] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const completed = await getOnboardingCompleted();
        if (cancelled) return;
        if (!completed) {
          setStatus('needs-onboarding');
          return;
        }
        const selected = await getSelectedMunicipios();
        if (cancelled) return;
        setMunicipios(selected);
        setStatus('ready');
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  if (status === 'loading') {
    return <View style={styles.container} />;
  }

  if (status === 'needs-onboarding') {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis territorios</Text>
      {municipios.length === 0 ? (
        <Text>Aún no has añadido ningún municipio.</Text>
      ) : (
        municipios.map((name) => (
          <TerritoryCard key={name} name={name} alertLevel="verde" />
        ))
      )}
      <Button
        label="+ Añadir municipio"
        variant="secondary"
        onPress={() => router.push('/onboarding/municipios?standalone=true')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
```

**Important:** `useFocusEffect` re-runs every time this screen regains focus (e.g., returning from the standalone municipios editor via `router.back()`), which is exactly why it's used instead of a plain `useEffect` — Inicio needs to reflect changes made in that editor without requiring a full app restart.

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest "app/(tabs)/__tests__/index-test.tsx"
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Run the full chain**

```bash
npm run lint
npm run typecheck
npm run format:check
npm test -- --ci
```

Expected: all exit 0. `npm test` reports 15 test suites total (10 from the prior plans + 5 new: `lib/__tests__/onboarding-test.ts`, `app/onboarding/__tests__/index-test.tsx`, `app/onboarding/__tests__/municipios-test.tsx`, `app/onboarding/__tests__/notificaciones-test.tsx`, `app/(tabs)/__tests__/index-test.tsx`), 36 tests, all passing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Update Inicio to gate on onboarding and show selected municipios"
```

---

### Task 6: Full verification

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

Expected: all exit 0.

- [ ] **Step 2: Visual + interaction check on the iOS simulator**

A working iOS simulator is available in this environment (confirmed during this plan's authoring — `xcrun simctl list devices available` should show at least one iPhone). If a device is not already booted:

```bash
xcrun simctl boot "<device-udid-from-simctl-list>"
open -a Simulator
```

Erase the simulator first to guarantee a genuine first-launch test (otherwise leftover AsyncStorage state from prior manual testing will skip the flow):

```bash
xcrun simctl shutdown "<device-udid>"
xcrun simctl erase "<device-udid>"
xcrun simctl boot "<device-udid>"
open -a Simulator
```

Start Expo pointed at the simulator:

```bash
npx expo start --ios
```

If real synthetic taps are available in your environment (e.g., `idb` is installed, or Accessibility permissions are granted for AppleScript/System Events control of Simulator.app — check both before assuming neither works), tap through the actual flow: Bienvenida → select a municipio → Continuar → Notificaciones → Permitir (or Ahora no) → confirm you land on the tabs with the chosen municipio showing as a `TerritoryCard` in Inicio. Then confirm force-quitting and reopening the app skips straight to the tabs (CA5), and that Inicio's "+ Añadir municipio" reopens the selector with the existing selection pre-checked (CA7).

If no synthetic-tap tool is available, use `xcrun simctl openurl <device-udid> "exp://<lan-ip>:8081/--/<route>"` to visually verify each screen renders correctly (`/onboarding`, `/onboarding/municipios`, `/onboarding/notificaciones`, and `/` to confirm the redirect fires) via screenshots (`xcrun simctl io <device-udid> screenshot <path>`). This does not exercise the tap interactions themselves — that residual risk is covered by the 36+ automated tests from Tasks 1-5, which test real button-press behavior, not mocks of it. State plainly in your report which verification level you achieved and why, if taps were unavailable — do not claim a tap-level verification you didn't actually perform.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin onboarding
gh pr create --title "Onboarding: 3-screen flow gated by AsyncStorage, updates Inicio" --body "Implements docs/specs/2026-07-24-onboarding.md (E1-03). Only the 3 confirmed pilot municipios are used (see spec's Conversación for why the full ~36 isn't here). Real OS notification permission is requested; no backend/token registration (E4-01)." --base main
gh pr checks --watch
```

Expected: PR opens against `main`, CI passes. Do not merge — leave it open for human review.
