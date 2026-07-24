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

test('el título tiene accessibilityRole header', async () => {
  await AsyncStorage.setItem('onboardingCompleted', 'true');
  await render(<InicioScreen />);
  const header = await screen.findByRole('header', { name: 'Mis territorios' });
  expect(header).toBeTruthy();
});
