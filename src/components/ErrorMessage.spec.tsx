import { screen } from '@testing-library/react';
import renderTestWithProviders from '@/utils/tests/renderTestWithProviders';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders a title with an error message when an error exists', async () => {
    renderTestWithProviders(<ErrorMessage />, {
      preloadedState: {
        errorMessages: {
          messages: [
            {
              title: 'a very specific error title',
              message: 'a specific error message'
            }
          ]
        }
      }
    });

    const title = await screen.findByText('a very specific error title');
    const message = await screen.findByText('a specific error message');

    expect(title).toBeInTheDocument();
    expect(message).toBeInTheDocument();
  });
});
