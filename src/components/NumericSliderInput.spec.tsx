import { render, screen } from '@testing-library/react';
import userEvents from '@testing-library/user-event';
import { Button } from '@mui/material';
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

    const element = screen.getByRole('spinbutton');
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

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(0);
  });

  it('calls onChange when input is updated', async () => {
    const onChangeHandler = jest.fn();
    const user = userEvents.setup();

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

    const input = screen.getByRole('spinbutton');

    await user.type(input, '180');
    await user.tab();

    expect(onChangeHandler).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with decimal input when step supports it', async () => {
    const onChangeHandler = jest.fn();
    const user = userEvents.setup();

    render(
      <NumericSliderInput
        min={0}
        max={1}
        step={0.01}
        defaultValue={0.5}
        value={0.5}
        label={'Pivot'}
        labelTooltip={'Pivot point'}
        onChange={onChangeHandler}
      />
    );

    const input = screen.getByRole('spinbutton');

    await user.clear(input);
    await user.type(input, '0.25');
    await user.tab();

    expect(onChangeHandler).toHaveBeenCalledWith(0.25);
  });

  it('renders additional controls to the right of the reset button when provided', () => {
    render(
      <NumericSliderInput
        min={-180}
        max={180}
        defaultValue={0}
        value={0}
        label={'H'}
        labelTooltip={'Hue'}
        onChange={jest.fn()}
        additionalControls={<Button>Extra</Button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Reset H' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Extra' })).toBeInTheDocument();
  });
});
