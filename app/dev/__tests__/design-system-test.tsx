import { render, screen } from '@testing-library/react-native';
import DesignSystemCatalogScreen from '../design-system';

test('renderiza las 4 secciones del catálogo sin crashear', async () => {
  await render(<DesignSystemCatalogScreen />);
  expect(screen.getByText('Button')).toBeTruthy();
  expect(screen.getByText('AlertLevelChip')).toBeTruthy();
  expect(screen.getByText('TerritoryCard')).toBeTruthy();
  expect(screen.getByText('DataFreshnessBanner')).toBeTruthy();
});
