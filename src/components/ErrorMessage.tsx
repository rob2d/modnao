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
  Snackbar,
  styled
} from '@mui/material';
import { usePrevious } from '@uidotdev/usehooks';
import { useCallback } from 'react';

const StyledSnackbar = styled(Snackbar)(
  () => `
& .MuiAlert-icon {
    font-size: 28px;
    align-items: center;
}
`
);

export default function ErrorMessage() {
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
    <StyledSnackbar
      open={Boolean(error)}
      onClose={onDismissError}
      TransitionComponent={ErrorTransition}
    >
      <Alert severity='error' variant={'filled'}>
        <AlertTitle>{errorShown?.title ?? ''}</AlertTitle>
        {errorShown?.message || ''}
      </Alert>
    </StyledSnackbar>
  );
}
