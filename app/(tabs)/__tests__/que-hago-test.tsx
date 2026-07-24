import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import QueHagoScreen from '../que-hago';

test('el título tiene accessibilityRole header', async () => {
  await render(<QueHagoScreen />);
  const header = screen.getByRole('header', { name: '¿Qué hago?' });
  expect(header).toBeTruthy();
});

test('por defecto muestra Inundación y Antes seleccionados con su contenido', async () => {
  await render(<QueHagoScreen />);
  expect(
    screen.getByRole('tab', { selected: true, name: 'Inundación' }),
  ).toBeTruthy();
  expect(
    screen.getByRole('tab', { selected: true, name: 'Antes' }),
  ).toBeTruthy();
  expect(
    screen.getByText(
      '[Contenido pendiente de validación por el equipo social del SAMA — Inundación / Antes]',
    ),
  ).toBeTruthy();
});

test('cambiar el evento actualiza el contenido y mantiene la fase activa', async () => {
  await render(<QueHagoScreen />);
  fireEvent.press(screen.getByRole('tab', { name: 'Creciente súbita' }));
  await waitFor(() => {
    expect(
      screen.getByRole('tab', { selected: true, name: 'Creciente súbita' }),
    ).toBeTruthy();
  });
  expect(
    screen.getByRole('tab', { selected: true, name: 'Antes' }),
  ).toBeTruthy();
  expect(
    screen.getByText(
      '[Contenido pendiente de validación por el equipo social del SAMA — Creciente súbita / Antes]',
    ),
  ).toBeTruthy();
});

test('cambiar la fase actualiza el contenido y mantiene el evento activo', async () => {
  await render(<QueHagoScreen />);
  fireEvent.press(screen.getByRole('tab', { name: 'Durante' }));
  await waitFor(() => {
    expect(
      screen.getByRole('tab', { selected: true, name: 'Durante' }),
    ).toBeTruthy();
  });
  expect(
    screen.getByRole('tab', { selected: true, name: 'Inundación' }),
  ).toBeTruthy();
  expect(
    screen.getByText(
      '[Contenido pendiente de validación por el equipo social del SAMA — Inundación / Durante]',
    ),
  ).toBeTruthy();
});

test('los selectores de evento y fase declaran minHeight 44', async () => {
  await render(<QueHagoScreen />);
  const tab = screen.getByTestId('evento-inundacion');
  const flatStyle = Object.assign({}, ...tab.props.style);
  expect(flatStyle.minHeight).toBe(44);
});
