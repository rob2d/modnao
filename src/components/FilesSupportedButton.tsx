import { showDialog } from '@/modules/dialogs';
import { useAppDispatch } from '@/storeTypings';
import { Button } from '@mui/material';
import clsx from 'clsx';
import { useCallback } from 'react';

export default function FilesSupportedButton({
  className
}: {
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const onShowFileSupportInfo = useCallback(() => {
    dispatch(
      showDialog({
        type: 'file-support-info',
        sx: {
          '& .MuiDialog-paper': {
            width: 'calc(100vw - 32px)',
            maxWidth: 'calc(100vw - 32px)'
          }
        }
      })
    );
  }, [dispatch]);

  return (
    <Button
      onClick={onShowFileSupportInfo}
      color='secondary'
      size='small'
      variant='text'
      className={clsx(className)}
    >
      What Files Are Supported?
    </Button>
  );
}
