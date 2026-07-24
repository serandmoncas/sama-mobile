import { render, screen } from '@testing-library/react-native';
import MapaScreen from '../mapa';

test('el título tiene accessibilityRole header', async () => {
  await render(<MapaScreen />);
  const header = screen.getByRole('header', { name: 'Mapa de estaciones' });
  expect(header).toBeTruthy();
});
