import { dismissError } from '@/modules/error-messages';
import { $errorMessages } from '@/modules/error-messages/errorMessagesStore';
import { Alert, AlertTitle, Slide, SlideProps, Snackbar } from '@mui/material';

import { usePrevious } from '@uidotdev/usehooks';
import { useCallback } from 'react';

const ErrorTransition = (props: SlideProps) => (
  <Slide {...props} direction='right' />
);

export default function ErrorMessage() {
  'use no memo';

  const error =
    $errorMessages.value.messages[$errorMessages.value.messages.length - 1] ??
    undefined;
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
