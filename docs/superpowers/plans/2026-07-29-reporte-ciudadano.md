# Reporte Ciudadano (E6-01 + E6-02) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder "Reportar" tab with a real citizen report form (photo + category + location + optional alias/phone) that saves reports to a persistent local queue, honestly labeled as pending since no real backend exists yet.

**Architecture:** A small AsyncStorage-backed queue library (`lib/reportes.ts`) holds report metadata; compressed photo files live in the device's persistent document directory and only their URI is stored in the queue. The `Reportar` screen composes `expo-image-picker` (photo capture/selection), a real compression-verification loop built on `expo-image-manipulator` + `expo-file-system`, and the existing MapLibre/`expo-location` stack (reused from E3-01) for an auto-located, tap-to-adjust mini-map pin. The pending queue renders on the same screen, below the form.

**Tech Stack:** Expo SDK 57, React Native 0.86, TypeScript strict, Expo Router, `expo-image-picker` ~57.0.6, `expo-image-manipulator` ~57.0.6, `expo-file-system` ~57.0.1 (new class-based `File`/`Paths` API), `@maplibre/maplibre-react-native` ^11.3.6 (existing), `expo-location` (existing), `@react-native-async-storage/async-storage` (existing), Jest + `@testing-library/react-native`.

## Global Constraints

- New dependencies allowed: `expo-image-picker`, `expo-image-manipulator` (per spec). `expo-file-system` is also required — discovered during hand-verification because `ImageManipulator`'s `ImageRef.saveAsync()` writes only to the cache directory, which does not satisfy the spec's "persists across app restarts" requirement (CA9); it is a small, non-sensitive utility dependency with no extra permissions.
- `expo-location` and `@maplibre/maplibre-react-native` already exist from E3-01 — reuse them; no config changes beyond what `expo-image-picker`'s plugin requires in `app.json`.
- No real network submission — there is no backend to send reports to yet.
- Visible copy in Spanish; code identifiers in English.
- TypeScript strict; no `any`.
- Do not touch `app/_layout.tsx`, `app/alerta/[id].tsx`, `app/(tabs)/mapa.tsx`, or any screen other than `app/(tabs)/reportar.tsx`.
- Do not modify `constants/Colors.ts` or `constants/AlertColors.ts`.
- Accessibility conventions already established in this project: `accessibilityRole` on interactive elements, `accessibilityLabel` (buttons) or `accessibilityState` (tabs/toggles) as applicable, `minHeight: 44` on tappable buttons.
- Report queue entries must never be marked as sent — status text is exactly `"Pendiente de envío — el panel de Dagran no existe todavía"`.
- `expo-image-manipulator`'s `manipulateAsync` function is deprecated — use the contextual API (`ImageManipulator.manipulate(uri)…renderAsync()` then `imageRef.saveAsync(...)`) shown in Task 3, not the deprecated one.

---

### Task 1: Install native dependencies and configure the image-picker plugin

**Files:**

- Modify: `package.json`, `package-lock.json` (via `npx expo install`)
- Modify: `app.json`

**Interfaces:**

- Produces: `expo-image-picker`, `expo-image-manipulator`, `expo-file-system` available as installed packages for Task 2/3 to import from.

- [ ] **Step 1: Install the three packages via the Expo CLI (keeps versions aligned with the installed Expo SDK)**

Run: `npx expo install expo-image-picker expo-image-manipulator expo-file-system`

Expected: command exits 0; `package.json` gains three new entries under `dependencies`: `"expo-image-manipulator": "~57.0.6"`, `"expo-image-picker": "~57.0.6"`, `"expo-file-system": "~57.0.1"` (exact patch versions may differ slightly if the registry has moved since this plan was written — trust whatever `expo install` resolves, as long as the major/minor matches `~57.0.x`).

- [ ] **Step 2: Register the `expo-image-picker` config plugin in `app.json`**

Open `app.json`. Inside the `"plugins"` array, immediately after the existing `expo-location` plugin block (the one ending `"locationAlwaysPermission": false }]`), add:

```json
[
  "expo-image-picker",
  {
    "photosPermission": "Permite que SAMA acceda a tus fotos para adjuntarlas a un reporte.",
    "cameraPermission": "Permite que SAMA use la cámara para tomar una foto de tu reporte.",
    "microphonePermission": false
  }
]
```

The `"plugins"` array must remain valid JSON — this new block is a sibling entry, comma-separated from the `expo-location` block before it and the closing `]` of the array after it. `expo-file-system` and `expo-image-manipulator` do not need plugin entries — they have no permission-gated native config.

- [ ] **Step 3: Verify the install didn't break anything**

Run: `npm run typecheck`
Expected: exits 0, no output (clean `tsc --noEmit`).

Run: `npx expo-doctor`
Expected: no new failures related to the three packages (pre-existing warnings unrelated to this change, if any, are not this task's concern).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json app.json
git commit -m "Add expo-image-picker, expo-image-manipulator, expo-file-system dependencies"
```

---

### Task 2: Local reports queue library

**Files:**

- Create: `lib/reportes.ts`
- Test: `lib/__tests__/reportes-test.ts`

**Interfaces:**

- Consumes: `@react-native-async-storage/async-storage` (already a project dependency; `AsyncStorage.getItem`/`setItem`).
- Produces (consumed by Task 3):
  - `type CategoriaReporte = 'nivel_rio' | 'deslizamiento' | 'obstruccion' | 'otro'`
  - `type Reporte = { id: string; fotoUri: string; categoria: CategoriaReporte; lngLat: [number, number]; alias: string | null; telefono: string | null; fecha: string; estado: 'pendiente' }`
  - `getReportes(): Promise<Reporte[]>`
  - `agregarReporte(datos: Omit<Reporte, 'id' | 'fecha' | 'estado'>): Promise<Reporte>`

- [ ] **Step 1: Write the failing test**

Create `lib/__tests__/reportes-test.ts`:

```ts
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { agregarReporte, getReportes } from '../reportes';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('getReportes es [] por defecto', async () => {
  expect(await getReportes()).toEqual([]);
});

test('agregarReporte persiste el reporte con estado pendiente', async () => {
  const reporte = await agregarReporte({
    fotoUri: 'file:///documento/reporte-1.jpg',
    categoria: 'nivel_rio',
    lngLat: [-75.5, 6.9],
    alias: null,
    telefono: null,
  });

  expect(reporte.estado).toBe('pendiente');
  expect(reporte.id).toBeTruthy();
  expect(reporte.fecha).toBeTruthy();

  const reportes = await getReportes();
  expect(reportes).toEqual([reporte]);
});

test('agregarReporte acumula varios reportes', async () => {
  await agregarReporte({
    fotoUri: 'file:///documento/reporte-1.jpg',
    categoria: 'nivel_rio',
    lngLat: [-75.5, 6.9],
    alias: null,
    telefono: null,
  });
  await agregarReporte({
    fotoUri: 'file:///documento/reporte-2.jpg',
    categoria: 'deslizamiento',
    lngLat: [-75.6, 7.0],
    alias: 'Juan',
    telefono: '3001234567',
  });

  const reportes = await getReportes();
  expect(reportes).toHaveLength(2);
  expect(reportes[1].alias).toBe('Juan');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx jest lib/__tests__/reportes-test.ts`
Expected: FAIL — `Cannot find module '../reportes'` (the file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `lib/reportes.ts`:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const REPORTES_KEY = 'reportesPendientes';

export type CategoriaReporte =
  'nivel_rio' | 'deslizamiento' | 'obstruccion' | 'otro';

export type Reporte = {
  id: string;
  fotoUri: string;
  categoria: CategoriaReporte;
  lngLat: [number, number];
  alias: string | null;
  telefono: string | null;
  fecha: string;
  estado: 'pendiente';
};

export async function getReportes(): Promise<Reporte[]> {
  const value = await AsyncStorage.getItem(REPORTES_KEY);
  return value ? JSON.parse(value) : [];
}

export async function agregarReporte(
  datos: Omit<Reporte, 'id' | 'fecha' | 'estado'>,
): Promise<Reporte> {
  const reportes = await getReportes();
  const reporte: Reporte = {
    ...datos,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    fecha: new Date().toISOString(),
    estado: 'pendiente',
  };
  await AsyncStorage.setItem(
    REPORTES_KEY,
    JSON.stringify([...reportes, reporte]),
  );
  return reporte;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx jest lib/__tests__/reportes-test.ts`
Expected: PASS — 3 passed, 3 total.

- [ ] **Step 5: Commit**

```bash
git add lib/reportes.ts lib/__tests__/reportes-test.ts
git commit -m "Add local reports queue library backed by AsyncStorage"
```

---

### Task 3: Reportar screen — form, verified photo compression, mini-map, pending queue

**Files:**

- Create: `constants/Reportar.ts`
- Modify: `app/(tabs)/reportar.tsx` (currently a placeholder — replace entirely)
- Test: `app/(tabs)/__tests__/reportar-test.tsx` (currently a single placeholder test — replace entirely)

**Interfaces:**

- Consumes:
  - From Task 2: `agregarReporte`, `getReportes`, `type CategoriaReporte`, `type Reporte` from `@/lib/reportes`.
  - `Text`, `View` from `@/components/Themed`.
  - `useColorScheme` from `@/components/useColorScheme`.
  - `Colors` from `@/constants/Colors` (existing — do not modify the file, only read `colors.border`, `colors.tint`, `colors.surface`, `colors.text`).
  - `Spacing`, `Typography` from `@/constants/Spacing`, `@/constants/Typography` (existing).
  - `Camera`, `Map`, `Marker` from `@maplibre/maplibre-react-native` (existing project dependency, reused from E3-01's `mapa.tsx`). `Marker` requires a `children` prop — pass a `FontAwesome` icon (see below), or `tsc` fails with `TS2741: Property 'children' is missing in type ... but required in type 'MarkerProps'`.
  - `FontAwesome` from `@expo/vector-icons/FontAwesome` (existing project convention for map icons, established in E3-01 after a real emoji-rendering bug).
  - `useFocusEffect` from `expo-router`.
  - `ImagePicker` (`* as ImagePicker`) from `expo-image-picker`.
  - `ImageManipulator`, `SaveFormat` from `expo-image-manipulator` — use the new contextual API (`ImageManipulator.manipulate(uri)`, not the deprecated `manipulateAsync`).
  - `File`, `Paths` from `expo-file-system`.
  - `Location` (`* as Location`) from `expo-location`.
- Produces: default-exported `ReportarScreen` component, replacing the tab's current placeholder.

- [ ] **Step 1: Create the screen's constants file**

Create `constants/Reportar.ts`:

```ts
import type { CategoriaReporte } from '@/lib/reportes';

export const CATEGORIAS: { id: CategoriaReporte; label: string }[] = [
  { id: 'nivel_rio', label: 'Nivel del río' },
  { id: 'deslizamiento', label: 'Deslizamiento' },
  { id: 'obstruccion', label: 'Obstrucción' },
  { id: 'otro', label: 'Otro' },
];

export const ANTIOQUIA_CENTER: [number, number] = [-75.5, 6.9];
export const ANTIOQUIA_ZOOM = 7;

export const MAX_FOTO_BYTES = 500_000;
```

- [ ] **Step 2: Write the failing test**

Replace the entire contents of `app/(tabs)/__tests__/reportar-test.tsx` with:

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

jest.mock('@maplibre/maplibre-react-native', () => ({
  Map: 'Map',
  Camera: 'Camera',
  Marker: 'Marker',
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: {
    manipulate: jest.fn(),
  },
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Paths: { document: 'file:///documento/' },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator } from 'expo-image-manipulator';
import { File } from 'expo-file-system';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import ReportarScreen from '../reportar';

const mockedRequestLocation =
  Location.requestForegroundPermissionsAsync as jest.Mock;
const mockedGetPosition = Location.getCurrentPositionAsync as jest.Mock;
const mockedRequestCamera =
  ImagePicker.requestCameraPermissionsAsync as jest.Mock;
const mockedRequestGaleria =
  ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const mockedLaunchCamera = ImagePicker.launchCameraAsync as jest.Mock;
const mockedLaunchGaleria = ImagePicker.launchImageLibraryAsync as jest.Mock;
const mockedManipulate = ImageManipulator.manipulate as jest.Mock;
const MockedFile = File as unknown as jest.Mock;

function mockCompresionExitosa() {
  mockedManipulate.mockReturnValue({
    resize: jest.fn().mockReturnThis(),
    renderAsync: jest.fn().mockResolvedValue({
      width: 800,
      saveAsync: jest
        .fn()
        .mockResolvedValue({ uri: 'file:///cache/comprimida.jpg' }),
    }),
  });
  MockedFile.mockImplementation((...args: unknown[]) => ({
    uri:
      typeof args[0] === 'string' ? args[0] : 'file:///documento/reporte.jpg',
    size: 100_000,
    copy: jest.fn(),
  }));
}

beforeEach(async () => {
  await AsyncStorage.clear();
  mockedRequestLocation.mockReset().mockResolvedValue({ status: 'denied' });
  mockedGetPosition.mockReset();
  mockedRequestCamera.mockReset();
  mockedRequestGaleria.mockReset();
  mockedLaunchCamera.mockReset();
  mockedLaunchGaleria.mockReset();
  mockedManipulate.mockReset();
  MockedFile.mockReset();
});

test('el título tiene accessibilityRole header', async () => {
  await render(<ReportarScreen />);
  const header = screen.getByRole('header', { name: 'Reportar' });
  expect(header).toBeTruthy();
});

test('los botones de foto tienen accessibilityRole, label y área tocable de 44px', async () => {
  await render(<ReportarScreen />);
  const tomarFoto = screen.getByTestId('boton-tomar-foto');
  expect(tomarFoto.props.accessibilityRole).toBe('button');
  expect(tomarFoto.props.accessibilityLabel).toBe('Tomar foto');
  const flatStyle = Object.assign({}, ...tomarFoto.props.style);
  expect(flatStyle.minHeight).toBe(44);

  const elegirGaleria = screen.getByTestId('boton-elegir-galeria');
  expect(elegirGaleria.props.accessibilityLabel).toBe('Elegir de galería');
});

test('tomar foto pide permiso de cámara y muestra la vista previa', async () => {
  mockedRequestCamera.mockResolvedValue({ status: 'granted' });
  mockedLaunchCamera.mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///camara/foto.jpg' }],
  });

  await render(<ReportarScreen />);
  await act(async () => {
    fireEvent.press(screen.getByTestId('boton-tomar-foto'));
  });

  expect(mockedRequestCamera).toHaveBeenCalled();
  expect(screen.getByTestId('foto-preview').props.source.uri).toBe(
    'file:///camara/foto.jpg',
  );
});

test('si se niega el permiso de cámara, no se muestra vista previa', async () => {
  mockedRequestCamera.mockResolvedValue({ status: 'denied' });

  await render(<ReportarScreen />);
  await act(async () => {
    fireEvent.press(screen.getByTestId('boton-tomar-foto'));
  });

  expect(mockedLaunchCamera).not.toHaveBeenCalled();
  expect(screen.queryByTestId('foto-preview')).toBeNull();
});

test('elegir de galería pide permiso de galería y muestra la vista previa', async () => {
  mockedRequestGaleria.mockResolvedValue({ status: 'granted' });
  mockedLaunchGaleria.mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///galeria/foto.jpg' }],
  });

  await render(<ReportarScreen />);
  await act(async () => {
    fireEvent.press(screen.getByTestId('boton-elegir-galeria'));
  });

  expect(mockedRequestGaleria).toHaveBeenCalled();
  expect(screen.getByTestId('foto-preview').props.source.uri).toBe(
    'file:///galeria/foto.jpg',
  );
});

test('las categorías tienen accessibilityRole tab y marcan la seleccionada', async () => {
  await render(<ReportarScreen />);
  const tab = screen.getByTestId('categoria-deslizamiento');
  expect(tab.props.accessibilityRole).toBe('tab');
  expect(tab.props.accessibilityState.selected).toBe(false);

  await act(async () => {
    fireEvent.press(tab);
  });

  expect(
    screen.getByTestId('categoria-deslizamiento').props.accessibilityState
      .selected,
  ).toBe(true);
  expect(
    screen.getByTestId('categoria-nivel_rio').props.accessibilityState.selected,
  ).toBe(false);
});

test('al abrir la pantalla se pide el permiso de ubicación automáticamente', async () => {
  mockedRequestLocation.mockResolvedValue({ status: 'granted' });
  mockedGetPosition.mockResolvedValue({
    coords: { longitude: -75.5, latitude: 6.9 },
  });

  await render(<ReportarScreen />);

  await act(async () => {});

  expect(mockedRequestLocation).toHaveBeenCalled();
  expect(mockedGetPosition).toHaveBeenCalled();
  expect(screen.getByTestId('pin-ubicacion')).toBeTruthy();
});

test('si se niega el permiso de ubicación, no aparece el pin hasta tocar el mapa', async () => {
  mockedRequestLocation.mockResolvedValue({ status: 'denied' });

  await render(<ReportarScreen />);
  await act(async () => {});

  expect(screen.queryByTestId('pin-ubicacion')).toBeNull();

  await act(async () => {
    fireEvent(screen.getByTestId('mini-mapa'), 'press', {
      nativeEvent: { lngLat: [-75.4, 6.8] },
    });
  });

  expect(screen.getByTestId('pin-ubicacion')).toBeTruthy();
});

test('muestra un error si falta foto, categoría o ubicación al enviar', async () => {
  await render(<ReportarScreen />);
  await act(async () => {
    fireEvent.press(screen.getByTestId('boton-enviar'));
  });

  expect(screen.getByTestId('error-formulario')).toBeTruthy();
});

test('envía el reporte y lo agrega a la lista de pendientes', async () => {
  mockCompresionExitosa();
  mockedRequestCamera.mockResolvedValue({ status: 'granted' });
  mockedLaunchCamera.mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///camara/foto.jpg' }],
  });

  await render(<ReportarScreen />);

  await act(async () => {
    fireEvent.press(screen.getByTestId('boton-tomar-foto'));
  });
  await act(async () => {
    fireEvent.press(screen.getByTestId('categoria-nivel_rio'));
  });
  await act(async () => {
    fireEvent(screen.getByTestId('mini-mapa'), 'press', {
      nativeEvent: { lngLat: [-75.4, 6.8] },
    });
  });

  await act(async () => {
    fireEvent.press(screen.getByTestId('boton-enviar'));
  });

  expect(screen.queryByTestId('error-formulario')).toBeNull();
  expect(
    screen.getByText(
      'Pendiente de envío — el panel de Dagran no existe todavía',
    ),
  ).toBeTruthy();
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx jest reportar-test`
Expected: FAIL. The `'el título tiene accessibilityRole header'` test passes (the placeholder already renders that header), but every other test fails — `boton-tomar-foto`, `categoria-*`, `mini-mapa`, `pin-ubicacion`, `error-formulario`, `boton-enviar`, and `foto-preview` don't exist on the placeholder screen.

- [ ] **Step 4: Replace the placeholder implementation**

Replace the entire contents of `app/(tabs)/reportar.tsx` with:

```tsx
import { useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { File, Paths } from 'expo-file-system';
import * as Location from 'expo-location';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import Typography from '@/constants/Typography';
import {
  ANTIOQUIA_CENTER,
  ANTIOQUIA_ZOOM,
  CATEGORIAS,
  MAX_FOTO_BYTES,
} from '@/constants/Reportar';
import {
  agregarReporte,
  getReportes,
  type CategoriaReporte,
  type Reporte,
} from '@/lib/reportes';

async function comprimirFoto(uriOriginal: string): Promise<string> {
  let ancho: number | undefined = undefined;
  let uriFinal = uriOriginal;

  for (let intento = 0; intento < 5; intento++) {
    const contexto = ancho
      ? ImageManipulator.manipulate(uriOriginal).resize({ width: ancho })
      : ImageManipulator.manipulate(uriOriginal);
    const imagen = await contexto.renderAsync();
    const resultado = await imagen.saveAsync({
      compress: 0.6,
      format: SaveFormat.JPEG,
    });
    const archivo = new File(resultado.uri);
    if (archivo.size !== null && archivo.size <= MAX_FOTO_BYTES) {
      uriFinal = resultado.uri;
      break;
    }
    uriFinal = resultado.uri;
    ancho = Math.round((ancho ?? imagen.width) * 0.7);
  }

  const destino = new File(Paths.document, `reporte-${Date.now()}.jpg`);
  const origen = new File(uriFinal);
  origen.copy(destino);
  return destino.uri;
}

export default function ReportarScreen() {
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<CategoriaReporte | null>(null);
  const [lngLat, setLngLat] = useState<[number, number] | null>(null);
  const [alias, setAlias] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const theme = useColorScheme();
  const colors = Colors[theme];

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getReportes().then((lista) => {
        if (!cancelled) setReportes(lista);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || cancelled) return;
        const posicion = await Location.getCurrentPositionAsync();
        if (cancelled) return;
        setLngLat(
          (actual) =>
            actual ?? [posicion.coords.longitude, posicion.coords.latitude],
        );
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  async function handleTomarFoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!resultado.canceled && resultado.assets[0]) {
      setFotoUri(resultado.assets[0].uri);
    }
  }

  async function handleElegirGaleria() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const resultado = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
    });
    if (!resultado.canceled && resultado.assets[0]) {
      setFotoUri(resultado.assets[0].uri);
    }
  }

  async function handleEnviar() {
    if (!fotoUri || !categoria || !lngLat) {
      setError('Falta foto, categoría o ubicación.');
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const fotoComprimida = await comprimirFoto(fotoUri);
      await agregarReporte({
        fotoUri: fotoComprimida,
        categoria,
        lngLat,
        alias: alias.trim() || null,
        telefono: telefono.trim() || null,
      });
      setFotoUri(null);
      setCategoria(null);
      setAlias('');
      setTelefono('');
      setReportes(await getReportes());
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title} accessibilityRole="header">
          Reportar
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Foto</Text>
          <View style={styles.rowButtons}>
            <Pressable
              testID="boton-tomar-foto"
              onPress={handleTomarFoto}
              accessibilityRole="button"
              accessibilityLabel="Tomar foto"
              style={[styles.button, { borderColor: colors.border }]}
            >
              <Text>Tomar foto</Text>
            </Pressable>
            <Pressable
              testID="boton-elegir-galeria"
              onPress={handleElegirGaleria}
              accessibilityRole="button"
              accessibilityLabel="Elegir de galería"
              style={[styles.button, { borderColor: colors.border }]}
            >
              <Text>Elegir de galería</Text>
            </Pressable>
          </View>
          {fotoUri && (
            <Image
              testID="foto-preview"
              source={{ uri: fotoUri }}
              style={styles.preview}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Categoría</Text>
          <View style={styles.rowButtons}>
            {CATEGORIAS.map((item) => {
              const isSelected = item.id === categoria;
              return (
                <Pressable
                  key={item.id}
                  testID={`categoria-${item.id}`}
                  onPress={() => setCategoria(item.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  style={[
                    styles.categoriaTab,
                    {
                      borderColor: isSelected ? colors.tint : colors.border,
                      backgroundColor: isSelected
                        ? colors.surface
                        : 'transparent',
                    },
                  ]}
                >
                  <Text style={isSelected ? { color: colors.tint } : undefined}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ubicación</Text>
          <View style={styles.miniMapContainer}>
            <Map
              testID="mini-mapa"
              style={styles.miniMap}
              mapStyle="https://tiles.openfreemap.org/styles/liberty"
              onPress={(event) => {
                setLngLat(event.nativeEvent.lngLat);
              }}
            >
              <Camera
                initialViewState={{
                  center: lngLat ?? ANTIOQUIA_CENTER,
                  zoom: ANTIOQUIA_ZOOM,
                }}
              />
              {lngLat && (
                <Marker testID="pin-ubicacion" lngLat={lngLat}>
                  <FontAwesome name="map-marker" size={32} color="#d32f2f" />
                </Marker>
              )}
            </Map>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Alias (opcional)</Text>
          <TextInput
            testID="input-alias"
            value={alias}
            onChangeText={setAlias}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
          />
          <Text style={styles.sectionLabel}>Teléfono (opcional)</Text>
          <TextInput
            testID="input-telefono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
          />
        </View>

        {error && (
          <Text testID="error-formulario" style={styles.errorText}>
            {error}
          </Text>
        )}

        <Pressable
          testID="boton-enviar"
          onPress={handleEnviar}
          disabled={enviando}
          accessibilityRole="button"
          accessibilityLabel="Enviar reporte"
          style={[
            styles.enviarButton,
            { backgroundColor: colors.tint, opacity: enviando ? 0.5 : 1 },
          ]}
        >
          <Text style={styles.enviarButtonLabel}>
            {enviando ? 'Guardando...' : 'Enviar reporte'}
          </Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mis reportes</Text>
          {reportes.length === 0 ? (
            <Text>Aún no has enviado ningún reporte.</Text>
          ) : (
            reportes.map((reporte) => (
              <View key={reporte.id} style={styles.reporteRow}>
                <Text>
                  {CATEGORIAS.find((c) => c.id === reporte.categoria)?.label}
                </Text>
                <Text style={styles.reporteEstado}>
                  Pendiente de envío — el panel de Dagran no existe todavía
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

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
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.subtitle,
  },
  rowButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  categoriaTab: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMapContainer: {
    height: 220,
    borderRadius: 8,
    overflow: 'hidden',
  },
  miniMap: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
  },
  errorText: {
    color: 'red',
  },
  enviarButton: {
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enviarButtonLabel: {
    ...Typography.body,
    color: 'white',
    fontWeight: '600',
  },
  reporteRow: {
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  reporteEstado: {
    ...Typography.caption,
  },
});
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx jest reportar-test`
Expected: PASS — 10 passed, 10 total.

- [ ] **Step 6: Run the full verification chain**

Run: `npm run typecheck` — expected: exits 0, no output.
Run: `npm run lint` — expected: 0 errors (pre-existing warning count elsewhere in the codebase is not this task's concern; no new errors or warnings on `constants/Reportar.ts`, `app/(tabs)/reportar.tsx`, or `app/(tabs)/__tests__/reportar-test.tsx`).
Run: `npx prettier --check "constants/Reportar.ts" "app/(tabs)/reportar.tsx" "app/(tabs)/__tests__/reportar-test.tsx"` — expected: `All matched files use Prettier code style!`. If not, run `npx prettier --write` on the same paths first.
Run: `npm test -- --ci` — expected: all suites pass (this project's full suite, no regressions in unrelated screens).

- [ ] **Step 7: Commit**

```bash
git add constants/Reportar.ts "app/(tabs)/reportar.tsx" "app/(tabs)/__tests__/reportar-test.tsx"
git commit -m "Replace Reportar placeholder with report form and local pending queue"
```

---

## Manual Verification (after all tasks, not automatable)

This project has no synthetic-tap tool in this environment (constraint documented since E3-01). Before considering the ticket done, the human partner should build and run the dev client (`npx expo run:ios` or `npx expo run:android` — MapLibre and the camera are native modules, this screen cannot run in Expo Go) and manually walk through: opening the Reportar tab, granting/denying location, taking or picking a photo, tapping the mini-map to move the pin, submitting with and without required fields, and confirming the pending report appears in "Mis reportes" after resubmitting the tab or restarting the app.
