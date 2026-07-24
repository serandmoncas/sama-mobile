jest.mock('../useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

import { render, screen } from '@testing-library/react-native';
import { TerritoryCard } from '../TerritoryCard';
import { useColorScheme } from '../useColorScheme';
import Colors from '@/constants/Colors';

const mockedUseColorScheme = useColorScheme as jest.Mock;

test('usa los colores de Colors.dark cuando el tema es oscuro', async () => {
  mockedUseColorScheme.mockReturnValue('dark');
  await render(
    <TerritoryCard name="Zaragoza" alertLevel="roja" testID="card" />,
  );
  const flatStyle = Object.assign(
    {},
    ...screen.getByTestId('card').props.style,
  );
  expect(flatStyle.backgroundColor).toBe(Colors.dark.surface);
  expect(flatStyle.borderColor).toBe(Colors.dark.border);
});

test('usa los colores de Colors.light cuando el tema es claro', async () => {
  mockedUseColorScheme.mockReturnValue('light');
  await render(
    <TerritoryCard name="Zaragoza" alertLevel="roja" testID="card" />,
  );
  const flatStyle = Object.assign(
    {},
    ...screen.getByTestId('card').props.style,
  );
  expect(flatStyle.backgroundColor).toBe(Colors.light.surface);
  expect(flatStyle.borderColor).toBe(Colors.light.border);
});
