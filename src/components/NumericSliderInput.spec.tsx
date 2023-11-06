import { render, screen } from '@testing-library/react';
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

    const elementsFound = await Promise.all([
      screen.findByText('H'),
      screen.findByRole('textbox')
    ]);

    for (const element of elementsFound) {
      expect(element).toBeInTheDocument();
    }
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

    const input = await screen.findByRole('textbox');
    expect(input).toHaveValue('0');
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

    const input = await screen.findByRole('textbox');

    await userEvents.type(input, '180');
    input.blur();

    expect(onChangeHandler).toBeCalledTimes(1);
  });
});
