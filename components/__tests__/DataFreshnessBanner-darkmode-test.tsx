jest.mock('../useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

import { render, screen } from '@testing-library/react-native';
import { DataFreshnessBanner } from '../DataFreshnessBanner';
import { useColorScheme } from '../useColorScheme';
import Colors from '@/constants/Colors';

const mockedUseColorScheme = useColorScheme as jest.Mock;

test('el texto usa colors.dark.textSecondary en modo oscuro', async () => {
  mockedUseColorScheme.mockReturnValue('dark');
  const now = new Date('2026-07-23T12:00:00Z');
  await render(<DataFreshnessBanner lastUpdated={now} now={now} />);
  const flatStyle = Object.assign(
    {},
    ...screen.getByText('hace instantes').props.style,
  );
  expect(flatStyle.color).toBe(Colors.dark.textSecondary);
});

test('el texto usa colors.light.textSecondary en modo claro', async () => {
  mockedUseColorScheme.mockReturnValue('light');
  const now = new Date('2026-07-23T12:00:00Z');
  await render(<DataFreshnessBanner lastUpdated={now} now={now} />);
  const flatStyle = Object.assign(
    {},
    ...screen.getByText('hace instantes').props.style,
  );
  expect(flatStyle.color).toBe(Colors.light.textSecondary);
});
