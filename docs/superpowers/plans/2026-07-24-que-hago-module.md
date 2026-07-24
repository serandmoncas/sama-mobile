# Módulo "¿Qué hago?" (E5-01) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the placeholder "¿Qué hago?" tab into a working offline recommendations module — event selector (3 types) × phase selector (Antes/Durante/Después) — with all content clearly marked as pending validation.

**Architecture:** A new typed data file (`constants/QueHago.ts`) holds the 3 event types, 3 phases, and the 9 event×phase content combinations (each a single placeholder string). `app/(tabs)/que-hago.tsx` is rewritten from a static placeholder into a stateful screen with two Pressable-based selector rows and a content list, following the accessibility conventions established in E1-05 (`accessibilityRole`, `accessibilityState`, `minHeight: 44`).

**Tech Stack:** Same as prior plans (Expo Router, TypeScript strict, Jest + `jest-expo`, `@testing-library/react-native`). No new dependencies.

## Global Constraints

- Branch `que-hago`, branched from `main`.
- No new dependencies. No color/token changes — `constants/Colors.ts` and `constants/AlertColors.ts` are untouched.
- Do not modify `app/_layout.tsx`, `app/alerta/[id].tsx`, or any screen other than `app/(tabs)/que-hago.tsx`.
- UI copy in Spanish; code identifiers in English. TypeScript strict; no `any`.
- All content is placeholder text explicitly marked as pending validation (see spec's Conversación) — do not write real civil-protection recommendations.
- The following pattern was hand-verified working in this exact repo before being written into this plan — use it exactly as shown: after a `fireEvent.press` that changes which element has `accessibilityState={{ selected: true }}`, the assertion on the newly-selected element must be wrapped in `await waitFor(...)` — asserting immediately after `fireEvent.press` without `waitFor` reads stale state from before the re-render.
- Every verification step must actually be run and its real output checked — never mark a step done because it "should" pass.

---

### Task 1: Content data file

**Files:**

- Create: `constants/QueHago.ts`

**Interfaces:**

- Produces: `EventoId` (`'inundacion' | 'creciente_subita' | 'avenida_torrencial'`), `Fase` (`'antes' | 'durante' | 'despues'`), `EVENTOS: { id: EventoId; label: string }[]`, `FASES: { id: Fase; label: string }[]`, `CONTENIDO: Record<EventoId, Record<Fase, string[]>>` — all consumed by Task 2's screen component.

This task has no tests of its own (it's static typed data, exercised indirectly through Task 2's screen tests) — just create the file and verify it typechecks.

- [ ] **Step 1: Create the data file**

```ts
export type EventoId = 'inundacion' | 'creciente_subita' | 'avenida_torrencial';
export type Fase = 'antes' | 'durante' | 'despues';

export const EVENTOS: { id: EventoId; label: string }[] = [
  { id: 'inundacion', label: 'Inundación' },
  { id: 'creciente_subita', label: 'Creciente súbita' },
  { id: 'avenida_torrencial', label: 'Avenida torrencial' },
];

export const FASES: { id: Fase; label: string }[] = [
  { id: 'antes', label: 'Antes' },
  { id: 'durante', label: 'Durante' },
  { id: 'despues', label: 'Después' },
];

function marcador(eventoLabel: string, faseLabel: string): string[] {
  return [
    `[Contenido pendiente de validación por el equipo social del SAMA — ${eventoLabel} / ${faseLabel}]`,
  ];
}

export const CONTENIDO: Record<EventoId, Record<Fase, string[]>> = {
  inundacion: {
    antes: marcador('Inundación', 'Antes'),
    durante: marcador('Inundación', 'Durante'),
    despues: marcador('Inundación', 'Después'),
  },
  creciente_subita: {
    antes: marcador('Creciente súbita', 'Antes'),
    durante: marcador('Creciente súbita', 'Durante'),
    despues: marcador('Creciente súbita', 'Después'),
  },
  avenida_torrencial: {
    antes: marcador('Avenida torrencial', 'Antes'),
    durante: marcador('Avenida torrencial', 'Durante'),
    despues: marcador('Avenida torrencial', 'Después'),
  },
};
```

- [ ] **Step 2: Verify it typechecks**

```bash
npm run typecheck
```

Expected: exit 0, no errors.

- [ ] **Step 3: Verify formatting**

```bash
npx prettier --check constants/QueHago.ts
```

Expected: "All matched files use Prettier code style!"

- [ ] **Step 4: Commit**

```bash
git add constants/QueHago.ts
git commit -m "Add content data for que-hago module"
```

---

### Task 2: Interactive screen

**Files:**

- Modify: `app/(tabs)/que-hago.tsx`
- Modify: `app/(tabs)/__tests__/que-hago-test.tsx`

**Interfaces:**

- Consumes: `EventoId`, `Fase`, `EVENTOS`, `FASES`, `CONTENIDO` from `@/constants/QueHago` (Task 1).

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `app/(tabs)/__tests__/que-hago-test.tsx` with:

```tsx
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import QueHagoScreen from '../que-hago';

test('el título tiene accessibilityRole header', async () => {
  await render(<QueHagoScreen />);
  const header = screen.getByRole('header', { name: '¿Qué hago?' });
  expect(header).toBeTruthy();
});

test('por defecto muestra Inundación y Antes seleccionados con su contenido', async () => {
  await render(<QueHagoScreen />);
  expect(
    screen.getByRole('tab', { selected: true, name: 'Inundación' }),
  ).toBeTruthy();
  expect(
    screen.getByRole('tab', { selected: true, name: 'Antes' }),
  ).toBeTruthy();
  expect(
    screen.getByText(
      '[Contenido pendiente de validación por el equipo social del SAMA — Inundación / Antes]',
    ),
  ).toBeTruthy();
});

test('cambiar el evento actualiza el contenido y mantiene la fase activa', async () => {
  await render(<QueHagoScreen />);
  fireEvent.press(screen.getByRole('tab', { name: 'Creciente súbita' }));
  await waitFor(() => {
    expect(
      screen.getByRole('tab', { selected: true, name: 'Creciente súbita' }),
    ).toBeTruthy();
  });
  expect(
    screen.getByRole('tab', { selected: true, name: 'Antes' }),
  ).toBeTruthy();
  expect(
    screen.getByText(
      '[Contenido pendiente de validación por el equipo social del SAMA — Creciente súbita / Antes]',
    ),
  ).toBeTruthy();
});

test('cambiar la fase actualiza el contenido y mantiene el evento activo', async () => {
  await render(<QueHagoScreen />);
  fireEvent.press(screen.getByRole('tab', { name: 'Durante' }));
  await waitFor(() => {
    expect(
      screen.getByRole('tab', { selected: true, name: 'Durante' }),
    ).toBeTruthy();
  });
  expect(
    screen.getByRole('tab', { selected: true, name: 'Inundación' }),
  ).toBeTruthy();
  expect(
    screen.getByText(
      '[Contenido pendiente de validación por el equipo social del SAMA — Inundación / Durante]',
    ),
  ).toBeTruthy();
});

test('los selectores de evento y fase declaran minHeight 44', async () => {
  await render(<QueHagoScreen />);
  const tab = screen.getByTestId('evento-inundacion');
  const flatStyle = Object.assign({}, ...tab.props.style);
  expect(flatStyle.minHeight).toBe(44);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest "app/\(tabs\)/__tests__/que-hago-test.tsx"
```

Expected: 4 of the 5 tests fail (no selector rows or content exist yet in the placeholder screen); the pre-existing header-role test still passes.

- [ ] **Step 3: Rewrite the screen**

Replace the entire contents of `app/(tabs)/que-hago.tsx` with:

```tsx
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
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

export default function QueHagoScreen() {
  const [evento, setEvento] = useState<EventoId>(EVENTOS[0].id);
  const [fase, setFase] = useState<Fase>(FASES[0].id);
  const theme = useColorScheme();
  const colors = Colors[theme];

  return (
    <View style={styles.container}>
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
                  borderColor: colors.border,
                  backgroundColor: isSelected ? colors.surface : 'transparent',
                },
              ]}
            >
              <Text style={styles.tabLabel}>{item.label}</Text>
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
                  borderColor: colors.border,
                  backgroundColor: isSelected ? colors.surface : 'transparent',
                },
              ]}
            >
              <Text style={styles.tabLabel}>{item.label}</Text>
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
});
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest "app/\(tabs\)/__tests__/que-hago-test.tsx"
```

Expected: PASS, 5/5 tests.

- [ ] **Step 5: Verify lint, typecheck, and formatting**

```bash
npm run lint
npm run typecheck
npx prettier --check "app/(tabs)/que-hago.tsx" "app/(tabs)/__tests__/que-hago-test.tsx"
```

Expected: lint 0 errors, typecheck clean, prettier "All matched files use Prettier code style!".

- [ ] **Step 6: Commit**

```bash
git add "app/(tabs)/que-hago.tsx" "app/(tabs)/__tests__/que-hago-test.tsx"
git commit -m "Implement interactive que-hago screen with event and phase selectors"
```

---

### Task 3: Full verification

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

Expected: all exit 0/clean. `npm test` should report 19 test suites (unchanged count — no new files, only `que-hago-test.tsx` grew from 1 to 5 tests) with 55 tests total (51 baseline + 4 new tests added to `que-hago-test.tsx` in Task 2) — read the real number from your own run and sanity-check it against this.

- [ ] **Step 2: Manual/visual check if a simulator is available**

If an iOS simulator or Android emulator is available in this environment, boot it, run `npx expo start --ios` (or `--android`), and navigate to the "¿Qué hago?" tab. Confirm visually: the two selector rows render side-by-side without overflow, the selected tab is visually distinguished (background fill), and the placeholder content text is legible. If no simulator/synthetic-tap tool is available, state that plainly — do not claim a check you didn't perform. Since there is no synthetic-tap tool in this environment (established constraint from prior cycles), switching tabs interactively can only be confirmed via the automated RNTL tests from Task 2, not a real tap in the simulator.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin que-hago
gh pr create --title "Add offline que-hago recommendations module (E5-01)" --body "Implements docs/specs/2026-07-24-que-hago-module.md (E5-01). Content is placeholder text explicitly marked as pending validation by SAMA's social team — see the spec's Conversación section for why real content wasn't fabricated." --base main
gh pr checks --watch
```

Expected: PR opens against `main`, CI passes. Do not merge — leave it open for human review.
