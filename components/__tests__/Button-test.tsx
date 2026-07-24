import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../Button';

test('dispara onPress al tocarlo', async () => {
  const onPress = jest.fn();
  await render(<Button label="Continuar" onPress={onPress} />);
  fireEvent.press(screen.getByText('Continuar'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('no dispara onPress cuando está disabled', async () => {
  const onPress = jest.fn();
  await render(<Button label="Continuar" onPress={onPress} disabled />);
  fireEvent.press(screen.getByText('Continuar'));
  expect(onPress).not.toHaveBeenCalled();
});
