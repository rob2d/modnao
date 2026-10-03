import { $messages, dismissError } from '@/modules/error-messages';
import { useValue } from '@legendapp/state/react';
import { Alert, AlertTitle, Slide, SlideProps, Snackbar } from '@mui/material';

import { usePrevious } from '@uidotdev/usehooks';
import { useCallback } from 'react';

const ErrorTransition = (props: SlideProps) => (
  <Slide {...props} direction='right' />
);

export default function ErrorMessage() {
  const error = useValue(
    () => $messages.get()[$messages.get().length - 1] ?? undefined
  );
  const prevError = usePrevious(error);

  // keep track of the error that was shown to avoid
  // collapsing of UI when dismissing in slide animation
  const errorShown = error ? error : prevError;

  const onDismissError = useCallback(() => {
    dismissError();
  }, []);

  return (
    <Snackbar
      open={Boolean(error)}
      onClose={onDismissError}
      TransitionComponent={ErrorTransition}
    >
      <Alert severity='error' variant={'filled'}>
        <AlertTitle>{errorShown?.title ?? ''}</AlertTitle>
        {errorShown?.message || ''}
      </Alert>
    </Snackbar>
  );
}
