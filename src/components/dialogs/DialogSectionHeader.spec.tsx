import { render, screen } from '@testing-library/react';
import DialogSectionHeader from './DialogSectionHeader';

describe('DialogSectionHeader', () => {
  it('renders', async () => {
    render(<DialogSectionHeader>Hello</DialogSectionHeader>);

    const mainText = await screen.findByText('Hello');
    expect(mainText).toBeInTheDocument();
  });
});
