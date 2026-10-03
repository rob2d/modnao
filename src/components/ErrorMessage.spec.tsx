import { dismissError, showError } from '@/modules/error-messages';
import renderTestWithProviders from '@/utils/tests/renderTestWithProviders';
import { act, screen, waitFor } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders a title with an error message when an error exists', async () => {
    renderTestWithProviders(<ErrorMessage />);

    act(() => {
      showError({
        title: 'a very specific error title',
        message: 'a specific error message'
      });
    });

    const title = await screen.findByText('a very specific error title');
    const message = await screen.findByText('a specific error message');

    expect(title).toBeInTheDocument();
    expect(message).toBeInTheDocument();
  });

  it('shows the latest error and returns to the previous error when dismissed', async () => {
    renderTestWithProviders(<ErrorMessage />);

    act(() => {
      showError({ title: 'first error', message: 'first message' });
      showError({ title: 'second error', message: 'second message' });
    });

    expect(await screen.findByText('second error')).toBeInTheDocument();
    expect(screen.queryByText('first error')).not.toBeInTheDocument();

    act(() => {
      dismissError();
    });

    expect(await screen.findByText('first error')).toBeInTheDocument();
    expect(screen.queryByText('second error')).not.toBeInTheDocument();

    act(() => {
      dismissError();
    });

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
