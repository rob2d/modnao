import { act, render, screen } from '@testing-library/react';
import userEvents from '@testing-library/user-event';
import NumericSliderInput from './NumericSliderInput';

describe('NumericSliderInput', () => {
  it('renders', async () => {
    render(
      <NumericSliderInput
        min={-180}
        max={180}
        defaultValue={0}
        value={0}
        label={'H'}
        labelTooltip={'Hue'}
        onChange={jest.fn()}
      />
    );

    const element = await screen.findByRole('spinbutton');
    expect(element).toBeInTheDocument();
  });

  it('renders with default input value', async () => {
    render(
      <NumericSliderInput
        min={-180}
        max={180}
        defaultValue={0}
        value={0}
        label={'H'}
        labelTooltip={'Hue'}
        onChange={jest.fn()}
      />
    );

    const input = await screen.findByRole('spinbutton');
    expect(input).toHaveValue(0);
  });

  it('calls onChange when input is updated', async () => {
    const onChangeHandler = jest.fn();
    render(
      <NumericSliderInput
        min={-180}
        max={180}
        defaultValue={0}
        value={0}
        label={'H'}
        labelTooltip={'Hue'}
        onChange={onChangeHandler}
      />
    );

    const input = await screen.findByRole('spinbutton');

    await act(async () => {
      await userEvents.type(input, '180');
      input.blur();

      expect(onChangeHandler).toHaveBeenCalledTimes(1);
    });
  });
});
