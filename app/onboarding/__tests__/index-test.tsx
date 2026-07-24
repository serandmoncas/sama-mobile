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

test('el título tiene accessibilityRole header', async () => {
  await render(<BienvenidaScreen />);
  const header = screen.getByRole('header', { name: 'SAMA' });
  expect(header).toBeTruthy();
});
