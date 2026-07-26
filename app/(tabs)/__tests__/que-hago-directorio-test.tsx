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
