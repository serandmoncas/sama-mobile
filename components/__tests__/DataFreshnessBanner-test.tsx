import { render, screen } from '@testing-library/react-native';
import { DataFreshnessBanner, formatRelativeTime } from '../DataFreshnessBanner';

describe('formatRelativeTime', () => {
  const now = new Date('2026-07-23T12:00:00Z');

  test('menos de un minuto', () => {
    const lastUpdated = new Date('2026-07-23T11:59:30Z');
    expect(formatRelativeTime(lastUpdated, now)).toBe('hace instantes');
  });

  test('minutos', () => {
    const lastUpdated = new Date('2026-07-23T11:35:00Z');
    expect(formatRelativeTime(lastUpdated, now)).toBe('hace 25 min');
  });

  test('horas, redondeado a horas enteras', () => {
    const lastUpdated = new Date('2026-07-23T09:00:00Z');
    expect(formatRelativeTime(lastUpdated, now)).toBe('hace 3 h');
  });
});

test('DataFreshnessBanner renderiza el texto relativo', async () => {
  const now = new Date('2026-07-23T12:00:00Z');
  const fiveMinAgo = new Date('2026-07-23T11:55:00Z');
  await render(<DataFreshnessBanner lastUpdated={fiveMinAgo} now={now} />);
  expect(screen.getByText('hace 5 min')).toBeTruthy();
});
