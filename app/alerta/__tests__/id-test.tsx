import { render, screen } from '@testing-library/react-native';
import AlertaDetailScreen from '../[id]';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '42' }),
}));

test('muestra el id recibido por parámetro de ruta', async () => {
  await render(<AlertaDetailScreen />);
  expect(screen.getByText('Alerta 42')).toBeTruthy();
});
