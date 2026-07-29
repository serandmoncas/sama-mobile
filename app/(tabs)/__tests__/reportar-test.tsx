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
const mockedRequestGallery =
  ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const mockedLaunchCamera = ImagePicker.launchCameraAsync as jest.Mock;
const mockedLaunchGallery = ImagePicker.launchImageLibraryAsync as jest.Mock;
const mockedManipulate = ImageManipulator.manipulate as jest.Mock;
const MockedFile = File as unknown as jest.Mock;

function mockSuccessfulCompression() {
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

function mockFailedCompression() {
  mockedManipulate.mockReturnValue({
    resize: jest.fn().mockReturnThis(),
    renderAsync: jest.fn().mockRejectedValue(new Error('fallo de compresión')),
  });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  mockedRequestLocation.mockReset().mockResolvedValue({ status: 'denied' });
  mockedGetPosition.mockReset();
  mockedRequestCamera.mockReset();
  mockedRequestGallery.mockReset();
  mockedLaunchCamera.mockReset();
  mockedLaunchGallery.mockReset();
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
  const takePhoto = screen.getByTestId('boton-tomar-foto');
  expect(takePhoto.props.accessibilityRole).toBe('button');
  expect(takePhoto.props.accessibilityLabel).toBe('Tomar foto');
  const flatStyle = Object.assign({}, ...takePhoto.props.style);
  expect(flatStyle.minHeight).toBe(44);

  const pickFromGallery = screen.getByTestId('boton-elegir-galeria');
  expect(pickFromGallery.props.accessibilityLabel).toBe('Elegir de galería');
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
  mockedRequestGallery.mockResolvedValue({ status: 'granted' });
  mockedLaunchGallery.mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///galeria/foto.jpg' }],
  });

  await render(<ReportarScreen />);
  await act(async () => {
    fireEvent.press(screen.getByTestId('boton-elegir-galeria'));
  });

  expect(mockedRequestGallery).toHaveBeenCalled();
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
  mockSuccessfulCompression();
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

test('si falla el guardado, muestra un error y no agrega el reporte a la lista', async () => {
  mockFailedCompression();
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

  expect(screen.getByTestId('error-formulario')).toHaveTextContent(
    'No se pudo guardar el reporte, intenta de nuevo.',
  );
  expect(screen.getByText('Aún no has enviado ningún reporte.')).toBeTruthy();
});
