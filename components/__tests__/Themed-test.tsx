import { render, screen } from '@testing-library/react-native';
import { Text } from '../Themed';

test('renders themed text', async () => {
  await render(<Text>Hola SAMA</Text>);
  expect(screen.getByText('Hola SAMA')).toBeTruthy();
});
