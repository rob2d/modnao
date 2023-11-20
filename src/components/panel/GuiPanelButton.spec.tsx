import { render, screen } from '@testing-library/react';
import GuiPanelButton from './GuiPanelButton';

describe('GuiPanelButton', () => {
  it('renders', async () => {
    const onClickHandler = jest.fn();
    render(
      <GuiPanelButton onClick={onClickHandler} tooltip='Downloads something'>
        Download
      </GuiPanelButton>
    );

    const elementsFound = await Promise.all([
      screen.findByLabelText('Downloads something'),
      screen.findByText('Download')
    ]);

    for (const element of elementsFound) {
      expect(element).toBeInTheDocument();
    }
  });
});
