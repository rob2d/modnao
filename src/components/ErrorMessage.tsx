import { useAppDispatch, useAppSelector } from '@/store';
import { dismissError } from '@/store/errorMessagesSlice';
import { mdiClose } from '@mdi/js';
import { Icon } from '@mdi/react';
import {
  Alert,
  AlertTitle,
  Button,
  Slide,
  SlideProps,
  Snackbar
} from '@mui/material';
import { usePrevious } from '@uidotdev/usehooks';
import { useCallback } from 'react';

export const ErrorMessage = () => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(
    (s) =>
      s.errorMessages.messages[s.errorMessages.messages.length - 1] ?? undefined
  );
  const prevError = usePrevious(error);

  // keep track of the error that was shown to avoid
  // collapsing of UI when dismissing in slide animation
  const errorShown = error ? error : prevError;

  const onDismissError = useCallback(() => {
    dispatch(dismissError());
  }, [dispatch]);

  const ErrorTransition = (props: SlideProps) => (
    <Slide {...props} direction='right' />
  );

  return (
    <Snackbar
      open={Boolean(error)}
      action={
        <Button color='inherit' onClick={onDismissError}>
          <Icon size={1.25} path={mdiClose} />
        </Button>
      }
      onClose={onDismissError}
      TransitionComponent={ErrorTransition}
    >
      <Alert severity='error' variant={'filled'}>
        <AlertTitle>{errorShown?.title ?? ''}</AlertTitle>
        {errorShown?.message || ''}
      </Alert>
    </Snackbar>
  );
};
