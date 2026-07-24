import { render, screen } from '@testing-library/react-native';
import { AlertLevelChip } from '../AlertLevelChip';

test.each([
  ['verde', 'Verde'],
  ['amarilla', 'Amarilla'],
  ['naranja', 'Naranja'],
  ['roja', 'Roja'],
] as const)(
  'muestra el texto correcto para el nivel %s',
  async (level, expectedLabel) => {
    await render(<AlertLevelChip level={level} />);
    expect(screen.getByText(expectedLabel)).toBeTruthy();
  },
);
