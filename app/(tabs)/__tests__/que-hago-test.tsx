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
  const eventoTab = screen.getByTestId('evento-inundacion');
  const eventoStyle = Object.assign({}, ...eventoTab.props.style);
  expect(eventoStyle.minHeight).toBe(44);

  const faseTab = screen.getByTestId('fase-antes');
  const faseStyle = Object.assign({}, ...faseTab.props.style);
  expect(faseStyle.minHeight).toBe(44);
});

test('los 3 eventos y las 3 fases están presentes', async () => {
  await render(<QueHagoScreen />);
  expect(screen.getByRole('tab', { name: 'Inundación' })).toBeTruthy();
  expect(screen.getByRole('tab', { name: 'Creciente súbita' })).toBeTruthy();
  expect(screen.getByRole('tab', { name: 'Avenida torrencial' })).toBeTruthy();
  expect(screen.getByRole('tab', { name: 'Antes' })).toBeTruthy();
  expect(screen.getByRole('tab', { name: 'Durante' })).toBeTruthy();
  expect(screen.getByRole('tab', { name: 'Después' })).toBeTruthy();
});

test('avenida torrencial y después muestran su propio contenido', async () => {
  await render(<QueHagoScreen />);
  fireEvent.press(screen.getByRole('tab', { name: 'Avenida torrencial' }));
  await waitFor(() => {
    expect(
      screen.getByRole('tab', { selected: true, name: 'Avenida torrencial' }),
    ).toBeTruthy();
  });
  fireEvent.press(screen.getByRole('tab', { name: 'Después' }));
  await waitFor(() => {
    expect(
      screen.getByRole('tab', { selected: true, name: 'Después' }),
    ).toBeTruthy();
  });
  expect(
    screen.getByText(
      '[Contenido pendiente de validación por el equipo social del SAMA — Avenida torrencial / Después]',
    ),
  ).toBeTruthy();
});
