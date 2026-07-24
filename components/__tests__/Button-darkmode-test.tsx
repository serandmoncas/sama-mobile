jest.mock('../useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

import { render, screen } from '@testing-library/react-native';
import { Button } from '../Button';
import { useColorScheme } from '../useColorScheme';
import Colors from '@/constants/Colors';

const mockedUseColorScheme = useColorScheme as jest.Mock;

test('el botón primario usa colors.dark.tint como fondo en modo oscuro', async () => {
  mockedUseColorScheme.mockReturnValue('dark');
  await render(<Button label="Continuar" onPress={() => {}} />);
  const flatStyle = Object.assign(
    {},
    ...screen.getByText('Continuar').parent!.props.style,
  );
  expect(flatStyle.backgroundColor).toBe(Colors.dark.tint);
});

test('el botón primario usa colors.light.tint como fondo en modo claro', async () => {
  mockedUseColorScheme.mockReturnValue('light');
  await render(<Button label="Continuar" onPress={() => {}} />);
  const flatStyle = Object.assign(
    {},
    ...screen.getByText('Continuar').parent!.props.style,
  );
  expect(flatStyle.backgroundColor).toBe(Colors.light.tint);
});
