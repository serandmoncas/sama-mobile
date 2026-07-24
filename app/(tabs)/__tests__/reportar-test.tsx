import { render, screen } from '@testing-library/react-native';
import ReportarScreen from '../reportar';

test('el título tiene accessibilityRole header', async () => {
  await render(<ReportarScreen />);
  const header = screen.getByRole('header', { name: 'Reportar' });
  expect(header).toBeTruthy();
});
