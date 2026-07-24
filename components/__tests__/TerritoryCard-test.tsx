import { render, screen } from '@testing-library/react-native';
import { TerritoryCard } from '../TerritoryCard';

test('renderiza el nombre del municipio y el chip de nivel', async () => {
  await render(<TerritoryCard name="Zaragoza" alertLevel="roja" />);
  expect(screen.getByText('Zaragoza')).toBeTruthy();
  expect(screen.getByText('Roja')).toBeTruthy();
});

test('tiene un accessibilityLabel combinando nombre y nivel', async () => {
  await render(<TerritoryCard name="Zaragoza" alertLevel="roja" />);
  const card = screen.getByLabelText('Zaragoza, nivel roja');
  expect(card).toBeTruthy();
});
