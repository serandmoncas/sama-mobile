jest.mock('@maplibre/maplibre-react-native', () => ({
  Map: 'Map',
  Camera: 'Camera',
  UserLocation: 'UserLocation',
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
}));

import * as Location from 'expo-location';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import MapaScreen from '../mapa';

const mockedRequest = Location.requestForegroundPermissionsAsync as jest.Mock;

beforeEach(() => {
  mockedRequest.mockReset();
});

test('el título tiene accessibilityRole header', async () => {
  await render(<MapaScreen />);
  const header = screen.getByRole('header', { name: 'Mapa de estaciones' });
  expect(header).toBeTruthy();
});

test('el botón de ubicación tiene accessibilityRole button, label y área tocable de 44px', async () => {
  await render(<MapaScreen />);
  const boton = screen.getByTestId('boton-mi-ubicacion');
  expect(boton.props.accessibilityRole).toBe('button');
  expect(boton.props.accessibilityLabel).toBe('Mi ubicación');
  const flatStyle = Object.assign({}, ...boton.props.style);
  expect(flatStyle.width).toBe(44);
  expect(flatStyle.height).toBe(44);
});

test('al tocar el botón, pide el permiso de ubicación', async () => {
  mockedRequest.mockResolvedValue({ status: 'granted' });
  await render(<MapaScreen />);
  await act(async () => {
    fireEvent.press(screen.getByTestId('boton-mi-ubicacion'));
  });
  expect(mockedRequest).toHaveBeenCalled();
});

test('si el permiso se niega, no crashea', async () => {
  mockedRequest.mockResolvedValue({ status: 'denied' });
  await render(<MapaScreen />);
  await act(async () => {
    fireEvent.press(screen.getByTestId('boton-mi-ubicacion'));
  });
  expect(mockedRequest).toHaveBeenCalled();
  expect(screen.getByTestId('boton-mi-ubicacion')).toBeTruthy();
});
