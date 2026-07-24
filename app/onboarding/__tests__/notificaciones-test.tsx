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
import {
  getNotificationsGranted,
  getOnboardingCompleted,
} from '@/lib/onboarding';

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
  expect(await getNotificationsGranted()).toBe(true);
});

test('Permitir completa el onboarding aunque el permiso falle', async () => {
  mockedRequest.mockRejectedValue(new Error('denied'));
  await render(<NotificacionesScreen />);
  fireEvent.press(screen.getByText('Permitir'));
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
