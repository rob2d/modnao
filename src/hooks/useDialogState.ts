import { useState, useCallback } from 'react';

export default function useDialogState(): [boolean, () => void, () => void] {
  const [dialogShown, setDialogShown] = useState(true);
  const onShowDialog = useCallback(() => {
    if (!dialogShown) {
      setDialogShown(true);
    }
  }, [dialogShown]);

  const onCloseDialog = useCallback(() => {
    dialogShown && setDialogShown(false);
  }, [dialogShown]);

  return [dialogShown, onShowDialog, onCloseDialog];
}
