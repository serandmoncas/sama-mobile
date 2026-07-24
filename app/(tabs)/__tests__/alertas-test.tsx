import { render, screen } from '@testing-library/react-native';
import AlertasScreen from '../alertas';

test('el título tiene accessibilityRole header', async () => {
  await render(<AlertasScreen />);
  const header = screen.getByRole('header', { name: 'Historial de alertas' });
  expect(header).toBeTruthy();
});
