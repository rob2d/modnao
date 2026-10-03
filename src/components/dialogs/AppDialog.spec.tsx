import {
  $dialogShown,
  $sx,
  closeDialog,
  showDialog
} from '@/modules/dialogs/dialogsStore';
import renderTestWithProviders from '@/utils/tests/renderTestWithProviders';
import { effect } from '@preact-signals/safe-react';
import { act, screen, waitFor } from '@testing-library/react';
import AppDialog from './AppDialog';

describe('AppDialog', () => {
  it('renders the correct dialog when opened and removes it when closed', async () => {
    renderTestWithProviders(<AppDialog />);

    act(() => {
      showDialog('file-support-info');
    });

    const dialog = await screen.findByTestId('app-dialog');
    const gettingStarted = await screen.findByText('Supported Files');

    expect(dialog).toBeInTheDocument();
    expect(gettingStarted).toBeInTheDocument();

    act(() => {
      closeDialog();
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('changes dialog type and styles together and clears previous styles', () => {
    closeDialog();

    const sx = { '& .MuiDialog-paper': { width: '400px' } };
    const states: [typeof $dialogShown.value, typeof $sx.value][] = [];
    const dispose = effect(() => {
      states.push([$dialogShown.value, $sx.value]);
    });

    try {
      showDialog({ type: 'file-support-info', sx });
      showDialog('app-info');
      closeDialog();

      expect(states).toEqual([
        [undefined, undefined],
        ['file-support-info', sx],
        ['app-info', undefined],
        [undefined, undefined]
      ]);
    } finally {
      dispose();
      closeDialog();
    }
  });
});
