import { showDialog, useAppDispatch } from '@/store';
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
    dispatch(showDialog('file-support-info'));
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
