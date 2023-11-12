import { screen } from '@testing-library/react';
import renderTestWithProviders from '@/utils/tests/renderTestWithProviders';
import AppDialog from './AppDialog';

describe('AppDialog', () => {
  it('renders the correct dialog when dialogShown state has a specified dialog set', async () => {
    renderTestWithProviders(<AppDialog />, {
      preloadedState: {
        dialogs: {
          dialogShown: 'file-support-info'
        }
      }
    });

    const dialog = await screen.findByTestId('app-dialog');
    const gettingStarted = await screen.findByText('Supported Files');

    expect(dialog).toBeInTheDocument();
    expect(gettingStarted).toBeInTheDocument();
  });
});
