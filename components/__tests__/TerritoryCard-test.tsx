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

test('no muestra aviso de cobertura por defecto', async () => {
  await render(<TerritoryCard name="Zaragoza" alertLevel="verde" />);
  expect(
    screen.queryByText('Cobertura de estaciones aún no confirmada'),
  ).toBeNull();
});

test('muestra aviso de cobertura cuando coberturaConfirmada es false', async () => {
  await render(
    <TerritoryCard
      name="Medellín"
      alertLevel="verde"
      coberturaConfirmada={false}
    />,
  );
  expect(
    screen.getByText('Cobertura de estaciones aún no confirmada'),
  ).toBeTruthy();
});
