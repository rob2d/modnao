import { useState, useCallback } from 'react';

export default function useDialogState(
  initialState: boolean
): [boolean, () => void, () => void] {
  const [dialogShown, setDialogShown] = useState(initialState);
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
