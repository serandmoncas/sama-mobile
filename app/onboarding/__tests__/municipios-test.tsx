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
  await AsyncStorage.setItem('selectedMunicipios', JSON.stringify(['Carepa']));
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

test('las filas de municipio declaran minHeight 44', async () => {
  await render(<MunicipiosScreen />);
  await waitFor(() => screen.getByText('Zaragoza'));
  const row = screen.getByTestId('municipio-Zaragoza');
  const flatStyle = Object.assign({}, ...row.props.style);
  expect(flatStyle.minHeight).toBe(44);
});

test('las filas de municipio tienen role checkbox con estado y label correctos', async () => {
  await render(<MunicipiosScreen />);
  await waitFor(() => screen.getByText('Zaragoza'));
  const unchecked = screen.getByLabelText('Zaragoza, no seleccionado');
  expect(unchecked.props.accessibilityRole).toBe('checkbox');
  expect(unchecked.props.accessibilityState).toEqual({ checked: false });

  fireEvent.press(unchecked);
  await waitFor(() => {
    const checked = screen.getByLabelText('Zaragoza, seleccionado');
    expect(checked.props.accessibilityState).toEqual({ checked: true });
  });
});

test('Volver tiene accessibilityRole button y minHeight 44', async () => {
  mockedParams.mockReturnValue({ standalone: 'true' });
  await render(<MunicipiosScreen />);
  await waitFor(() => screen.getByText('Volver'));
  const volver = screen.getByRole('button', { name: 'Volver' });
  const flatStyle = Object.assign({}, volver.props.style);
  expect(flatStyle.minHeight).toBe(44);
});
