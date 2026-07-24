# Design System (E1-02) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add color/typography/spacing tokens and 4 reusable components (Button, AlertLevelChip, TerritoryCard, DataFreshnessBanner) as a standalone library, verified via a catalog screen — no wiring into the existing tab screens.

**Architecture:** Tokens as plain exported TS objects under `constants/` (extending the existing `Colors.ts` pattern from the harness). Components under `components/`, following `Themed.tsx`'s existing light/dark pattern via `useColorScheme`. A new route `app/dev/design-system.tsx` (auto-registered by Expo Router file-based routing — no changes needed to `app/_layout.tsx`) renders every component with 2-3 variants for visual verification.

**Tech Stack:** Same as the harness — Expo Router, TypeScript strict, Jest + `jest-expo` preset, `@testing-library/react-native` (async `render()`).

## Global Constraints

- Branch `design-system`, branched from `harness/bootstrap`. PR targets `harness/bootstrap`, not `main`.
- No new dependencies (no react-native-paper, tamagui, restyle, etc.) — plain TypeScript + `StyleSheet`.
- Tokens/components live in `constants/` and `components/` — do not create `src/design-system/`.
- UI copy in Spanish; code identifiers in English.
- TypeScript strict; no `any`.
- Do not modify `app/(tabs)/*.tsx`, `app/alerta/[id].tsx`, or `app/_layout.tsx` in this plan.
- All alert-level and neutral color tokens must meet WCAG AA (≥4.5:1 contrast) for their documented text/background pairing — exact ratios are given in Task 1, use them verbatim, don't substitute different hex values.
- No text component may set `allowFontScaling={false}`.
- Every verification step must actually be run and its real output checked — never mark a step done because it "should" pass.

---

### Task 1: Color, typography, and spacing tokens

**Files:**
- Modify: `constants/Colors.ts`
- Create: `constants/AlertColors.ts`
- Create: `constants/Typography.ts`
- Create: `constants/Spacing.ts`

**Interfaces:**
- Produces: `Colors.light.surface`, `Colors.light.border`, `Colors.light.textSecondary` (and dark equivalents) — consumed by Task 4 (`TerritoryCard`). `AlertColors` default export + `AlertLevel` type — consumed by Tasks 3-4 and the catalog screen. `Typography` default export — consumed by Tasks 2-5. `Spacing` default export — consumed by Tasks 2-6.

- [ ] **Step 1: Extend `constants/Colors.ts` with neutral surface/border/text tokens**

Replace the file's content with:

```ts
// textSecondary: contraste verificado contra su fondo (AA ≥4.5:1):
//   claro: #6B7280 sobre #fff  → 4.83:1
//   oscuro: #9CA3AF sobre #000 → 8.27:1
// surface/border son colores de superficie/contorno, no de texto — el
// contraste AA de texto no aplica directamente a ellos; el par relevante
// es el texto que se pinte encima (text/textSecondary), ya cubierto arriba.
const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    textSecondary: '#6B7280',
    background: '#fff',
    surface: '#F5F5F5',
    border: '#E0E0E0',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    textSecondary: '#9CA3AF',
    background: '#000',
    surface: '#1C1C1E',
    border: '#3A3A3C',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
```

This only adds keys (`textSecondary`, `surface`, `border`) to both `light` and `dark` — every pre-existing key (`text`, `background`, `tint`, `tabIconDefault`, `tabIconSelected`) and its value is unchanged, so nothing that already consumes `Colors` (`components/Themed.tsx`, `app/(tabs)/_layout.tsx`) breaks.

- [ ] **Step 2: Create the alert-level color tokens**

`constants/AlertColors.ts`:

```ts
export type AlertLevel = 'verde' | 'amarilla' | 'naranja' | 'roja';

// Colores semánticos de nivel de alerta. Fijos (no varían con el tema
// claro/oscuro de la app) — son insignias de estado, como un semáforo real.
// Contraste verificado contra WCAG AA (≥4.5:1) para el par fondo/texto:
//   verde:    #15803D + blanco  → 5.01:1
//   amarilla: #FACC15 + negro   → 13.71:1
//   naranja:  #C2410C + blanco  → 5.18:1
//   roja:     #B91C1C + blanco  → 6.47:1
// Provisional: reemplazar cuando exista la guía visual validada de E0-03.
export default {
  verde: { background: '#15803D', text: '#FFFFFF' },
  amarilla: { background: '#FACC15', text: '#000000' },
  naranja: { background: '#C2410C', text: '#FFFFFF' },
  roja: { background: '#B91C1C', text: '#FFFFFF' },
} satisfies Record<AlertLevel, { background: string; text: string }>;
```

- [ ] **Step 3: Create the typography scale**

`constants/Typography.ts`:

```ts
// Escala tipográfica provisional — pendiente de reemplazar cuando exista
// la guía visual validada de E0-03.
export default {
  title: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  subtitle: { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
} as const;
```

The `as const` is required: React Native's `TextStyle.fontWeight` type only accepts a specific string-literal union (`'400'`, `'700'`, etc.), not a generic `string`. Without `as const`, spreading `...Typography.title` into a `StyleSheet.create` call fails typecheck.

- [ ] **Step 4: Create the spacing scale**

`constants/Spacing.ts`:

```ts
// Escala de espaciado provisional — pendiente de reemplazar cuando exista
// la guía visual validada de E0-03.
export default {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;
```

- [ ] **Step 5: Verify typecheck and lint**

```bash
npm run typecheck
npm run lint
```

Expected: both exit 0. (No new tests in this task — these are pure data files with no logic; Tasks 2-6's component tests are what exercises them.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add color, typography, and spacing tokens"
```

---

### Task 2: Button component

**Files:**
- Create: `components/Button.tsx`
- Create: `components/__tests__/Button-test.tsx`

**Interfaces:**
- Consumes: `Colors` (Task 1), `Spacing`/`Typography` (Task 1), `useColorScheme` (existing, `components/useColorScheme.ts`).
- Produces: `Button` component with props `{ label: string; onPress: () => void; variant?: 'primary' | 'secondary'; disabled?: boolean }` — consumed by the catalog screen (Task 6).

- [ ] **Step 1: Write the failing tests**

`components/__tests__/Button-test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../Button';

test('dispara onPress al tocarlo', async () => {
  const onPress = jest.fn();
  await render(<Button label="Continuar" onPress={onPress} />);
  fireEvent.press(screen.getByText('Continuar'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('no dispara onPress cuando está disabled', async () => {
  const onPress = jest.fn();
  await render(<Button label="Continuar" onPress={onPress} disabled />);
  fireEvent.press(screen.getByText('Continuar'));
  expect(onPress).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest components/__tests__/Button-test.tsx
```

Expected: FAIL with "Cannot find module '../Button'".

- [ ] **Step 3: Implement the component**

> **Correction (2026-07-23, found + verified during Task 2 execution):** the
> `Pressable` below sets `disabled={disabled}` in addition to nulling `onPress`.
> Without the native `disabled` prop, `fireEvent.press` in the pinned
> `@testing-library/react-native` version still matches and fires the `Button`
> composite's own (never-nulled) `onPress` prop while climbing ancestors looking
> for a handler, because `Pressability`'s `onStartShouldSetResponder` only
> reads `disabled` from the `Pressable`'s own prop, not from whether `onPress`
> was nulled. Verified independently by the task reviewer via source-tracing
> `fire-event.js` and `Pressability.js`, and by reproducing the test failure
> with the line removed. This also fixes real (non-test) behavior: a disabled
> control should set the native `disabled` prop regardless.

`components/Button.tsx`:

```tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import { useColorScheme } from './useColorScheme';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  const theme = useColorScheme();
  const colors = Colors[theme];
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={[
        styles.base,
        {
          backgroundColor: isPrimary ? colors.tint : 'transparent',
          borderColor: colors.tint,
          borderWidth: isPrimary ? 0 : 1,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: isPrimary ? colors.background : colors.tint }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
  },
});
```

`minHeight: 44` satisfies the ≥44px touch-target requirement from E1-05 (accessibility base) — free to get right now since it costs nothing extra.

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest components/__tests__/Button-test.tsx
```

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add Button component"
```

---

### Task 3: AlertLevelChip component

**Files:**
- Create: `components/AlertLevelChip.tsx`
- Create: `components/__tests__/AlertLevelChip-test.tsx`

**Interfaces:**
- Consumes: `AlertColors`, `AlertLevel` (Task 1), `Spacing`/`Typography` (Task 1).
- Produces: `AlertLevelChip` component with prop `{ level: AlertLevel }` — consumed by `TerritoryCard` (Task 4) and the catalog screen (Task 6).

- [ ] **Step 1: Write the failing test**

`components/__tests__/AlertLevelChip-test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { AlertLevelChip } from '../AlertLevelChip';

test.each([
  ['verde', 'Verde'],
  ['amarilla', 'Amarilla'],
  ['naranja', 'Naranja'],
  ['roja', 'Roja'],
] as const)('muestra el texto correcto para el nivel %s', async (level, expectedLabel) => {
  await render(<AlertLevelChip level={level} />);
  expect(screen.getByText(expectedLabel)).toBeTruthy();
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest components/__tests__/AlertLevelChip-test.tsx
```

Expected: FAIL with "Cannot find module '../AlertLevelChip'".

- [ ] **Step 3: Implement the component**

`components/AlertLevelChip.tsx`:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import AlertColors, { type AlertLevel } from '@/constants/AlertColors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';

const LEVEL_LABELS: Record<AlertLevel, string> = {
  verde: 'Verde',
  amarilla: 'Amarilla',
  naranja: 'Naranja',
  roja: 'Roja',
};

type AlertLevelChipProps = {
  level: AlertLevel;
};

export function AlertLevelChip({ level }: AlertLevelChipProps) {
  const colors = AlertColors[level];

  return (
    <View style={[styles.chip, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>{LEVEL_LABELS[level]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx jest components/__tests__/AlertLevelChip-test.tsx
```

Expected: PASS, 4 tests (one per `test.each` row).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add AlertLevelChip component"
```

---

### Task 4: TerritoryCard component

**Files:**
- Create: `components/TerritoryCard.tsx`
- Create: `components/__tests__/TerritoryCard-test.tsx`

**Interfaces:**
- Consumes: `AlertLevelChip` (Task 3), `AlertLevel` type (Task 1), `Colors`/`Spacing`/`Typography` (Task 1), `Text` from `components/Themed.tsx` (existing), `useColorScheme` (existing).
- Produces: `TerritoryCard` component with props `{ name: string; alertLevel: AlertLevel; onPress?: () => void }` — consumed by the catalog screen (Task 6).

- [ ] **Step 1: Write the failing test**

`components/__tests__/TerritoryCard-test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { TerritoryCard } from '../TerritoryCard';

test('renderiza el nombre del municipio y el chip de nivel', async () => {
  await render(<TerritoryCard name="Zaragoza" alertLevel="roja" />);
  expect(screen.getByText('Zaragoza')).toBeTruthy();
  expect(screen.getByText('Roja')).toBeTruthy();
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest components/__tests__/TerritoryCard-test.tsx
```

Expected: FAIL with "Cannot find module '../TerritoryCard'".

- [ ] **Step 3: Implement the component**

`components/TerritoryCard.tsx`:

```tsx
import { Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from './useColorScheme';
import { Text } from './Themed';
import { AlertLevelChip } from './AlertLevelChip';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';
import type { AlertLevel } from '@/constants/AlertColors';

type TerritoryCardProps = {
  name: string;
  alertLevel: AlertLevel;
  onPress?: () => void;
};

export function TerritoryCard({ name, alertLevel, onPress }: TerritoryCardProps) {
  const theme = useColorScheme();
  const colors = Colors[theme];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Text style={styles.name}>{name}</Text>
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
  name: {
    ...Typography.subtitle,
  },
});
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx jest components/__tests__/TerritoryCard-test.tsx
```

Expected: PASS, 1 test.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add TerritoryCard component"
```

---

### Task 5: DataFreshnessBanner component

**Files:**
- Create: `components/DataFreshnessBanner.tsx`
- Create: `components/__tests__/DataFreshnessBanner-test.tsx`

**Interfaces:**
- Consumes: `useColorScheme` (existing, `components/useColorScheme.ts`), `Colors`/`Spacing`/`Typography` (Task 1).
- Produces: `DataFreshnessBanner` component with prop `{ lastUpdated: Date }`, and the exported pure function `formatRelativeTime(lastUpdated: Date, now?: Date): string` — consumed by the catalog screen (Task 6).

- [ ] **Step 1: Write the failing tests**

`components/__tests__/DataFreshnessBanner-test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import { DataFreshnessBanner, formatRelativeTime } from '../DataFreshnessBanner';

describe('formatRelativeTime', () => {
  const now = new Date('2026-07-23T12:00:00Z');

  test('menos de un minuto', () => {
    const lastUpdated = new Date('2026-07-23T11:59:30Z');
    expect(formatRelativeTime(lastUpdated, now)).toBe('hace instantes');
  });

  test('minutos', () => {
    const lastUpdated = new Date('2026-07-23T11:35:00Z');
    expect(formatRelativeTime(lastUpdated, now)).toBe('hace 25 min');
  });

  test('horas, redondeado a horas enteras', () => {
    const lastUpdated = new Date('2026-07-23T09:00:00Z');
    expect(formatRelativeTime(lastUpdated, now)).toBe('hace 3 h');
  });
});

test('DataFreshnessBanner renderiza el texto relativo', async () => {
  const now = new Date('2026-07-23T12:00:00Z');
  const fiveMinAgo = new Date('2026-07-23T11:55:00Z');
  await render(<DataFreshnessBanner lastUpdated={fiveMinAgo} now={now} />);
  expect(screen.getByText('hace 5 min')).toBeTruthy();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx jest components/__tests__/DataFreshnessBanner-test.tsx
```

Expected: FAIL with "Cannot find module '../DataFreshnessBanner'".

- [ ] **Step 3: Implement the component**

`components/DataFreshnessBanner.tsx`:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from './useColorScheme';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';

export function formatRelativeTime(lastUpdated: Date, now: Date = new Date()): string {
  const diffMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000);

  if (diffMinutes < 1) {
    return 'hace instantes';
  }
  if (diffMinutes < 60) {
    return `hace ${diffMinutes} min`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  return `hace ${diffHours} h`;
}

type DataFreshnessBannerProps = {
  lastUpdated: Date;
  /** Injectable for tests; defaults to the real current time. */
  now?: Date;
};

export function DataFreshnessBanner({ lastUpdated, now }: DataFreshnessBannerProps) {
  const theme = useColorScheme();
  const colors = Colors[theme];

  return (
    <View style={styles.banner}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {formatRelativeTime(lastUpdated, now)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  text: {
    ...Typography.caption,
  },
});
```

Uses `colors.textSecondary` (added in Task 1) directly rather than `components/Themed.tsx`'s `Text`, which only exposes the primary `text` color — a muted/secondary color is the correct semantic fit for a timestamp caption, and this keeps `textSecondary` a real, consumed token rather than dead code declared in Task 1 and never used.

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx jest components/__tests__/DataFreshnessBanner-test.tsx
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add DataFreshnessBanner component"
```

---

### Task 6: Catalog screen

**Files:**
- Create: `app/dev/design-system.tsx`
- Create: `app/dev/__tests__/design-system-test.tsx`

**Interfaces:**
- Consumes: `Button` (Task 2), `AlertLevelChip` (Task 3), `TerritoryCard` (Task 4), `DataFreshnessBanner` (Task 5), `AlertLevel` type (Task 1), `Spacing`/`Typography` (Task 1), `Text`/`View` from `components/Themed.tsx`.
- Produces: the route `/dev/design-system`, reachable via direct URL during development (not linked from any tab). No later task in this plan consumes this screen.

- [ ] **Step 1: Write the failing smoke test**

`app/dev/__tests__/design-system-test.tsx`:

```tsx
import { render, screen } from '@testing-library/react-native';
import DesignSystemCatalogScreen from '../design-system';

test('renderiza las 4 secciones del catálogo sin crashear', async () => {
  await render(<DesignSystemCatalogScreen />);
  expect(screen.getByText('Button')).toBeTruthy();
  expect(screen.getByText('AlertLevelChip')).toBeTruthy();
  expect(screen.getByText('TerritoryCard')).toBeTruthy();
  expect(screen.getByText('DataFreshnessBanner')).toBeTruthy();
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx jest app/dev/__tests__/design-system-test.tsx
```

Expected: FAIL with "Cannot find module '../design-system'".

- [ ] **Step 3: Implement the catalog screen**

`app/dev/design-system.tsx`:

```tsx
import { ScrollView, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Button } from '@/components/Button';
import { AlertLevelChip } from '@/components/AlertLevelChip';
import { TerritoryCard } from '@/components/TerritoryCard';
import { DataFreshnessBanner } from '@/components/DataFreshnessBanner';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';
import type { AlertLevel } from '@/constants/AlertColors';

const ALERT_LEVELS: AlertLevel[] = ['verde', 'amarilla', 'naranja', 'roja'];

export default function DesignSystemCatalogScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.section}>Button</Text>
      <View style={styles.row}>
        <Button label="Primario" onPress={() => {}} />
        <Button label="Secundario" onPress={() => {}} variant="secondary" />
        <Button label="Deshabilitado" onPress={() => {}} disabled />
      </View>

      <Text style={styles.section}>AlertLevelChip</Text>
      <View style={styles.row}>
        {ALERT_LEVELS.map((level) => (
          <AlertLevelChip key={level} level={level} />
        ))}
      </View>

      <Text style={styles.section}>TerritoryCard</Text>
      <View style={styles.column}>
        {ALERT_LEVELS.map((level) => (
          <TerritoryCard key={level} name={`Municipio ${level}`} alertLevel={level} />
        ))}
      </View>

      <Text style={styles.section}>DataFreshnessBanner</Text>
      <View style={styles.column}>
        <DataFreshnessBanner lastUpdated={new Date()} />
        <DataFreshnessBanner lastUpdated={new Date(Date.now() - 20 * 60000)} />
        <DataFreshnessBanner lastUpdated={new Date(Date.now() - 3 * 3600000)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  section: {
    ...Typography.title,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  column: {
    gap: Spacing.md,
  },
});
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx jest app/dev/__tests__/design-system-test.tsx
```

Expected: PASS, 1 test.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add design system catalog screen at /dev/design-system"
```

---

### Task 7: Full verification

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

Expected: all exit 0. `npm test` reports 7 test suites total (2 from the harness + Button, AlertLevelChip, TerritoryCard, DataFreshnessBanner, design-system catalog = 5 new), all passing. If `format:check` fails, run `npm run format` and re-verify — do not hand-fix formatting.

- [ ] **Step 2: Visual check on a real device (Expo Go)**

```bash
npm start
```

On your phone with Expo Go installed, scan the QR code, then navigate to `exp://<the-IP-shown-in-the-terminal>/--/dev/design-system` (open it as a link, e.g. from a notes app or browser on the same phone). Confirm: all 4 component sections render, the button's 3 states look distinct, all 4 alert chips show distinct colors with legible text, all 4 territory cards show a name + chip, and the 3 freshness banners show "hace instantes"/"hace 20 min"/"hace 3 h". Toggle the phone's system dark mode and reload to confirm the card/text colors adapt.

Report the real result of this manual check — if something looks wrong (e.g., a color that doesn't render as expected, text that's clipped), fix it and re-verify before moving on.

- [ ] **Step 3: Push and open the PR**

```bash
git push -u origin design-system
gh pr create --title "Design system: tokens + Button/AlertLevelChip/TerritoryCard/DataFreshnessBanner" --body "Implements docs/specs/2026-07-23-design-system.md (E1-02). Targets harness/bootstrap, not main, since that branch's PR #1 is still open. Provisional tokens — see the spec's Conversación section for why, and docs/adr if this needs a formal ADR once E0-03's visual guide exists." --base harness/bootstrap
gh pr checks --watch
```

Expected: PR opens against `harness/bootstrap`, and CI passes. Do not merge — leave it open for human review, same as PR #1.
