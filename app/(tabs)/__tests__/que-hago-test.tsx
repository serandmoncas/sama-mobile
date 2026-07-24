import { render, screen } from '@testing-library/react-native';
import QueHagoScreen from '../que-hago';

test('el título tiene accessibilityRole header', async () => {
  await render(<QueHagoScreen />);
  const header = screen.getByRole('header', { name: '¿Qué hago?' });
  expect(header).toBeTruthy();
});
