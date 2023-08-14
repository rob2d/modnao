import { useCallback, useState } from 'react';

export type DialogFunctionality = {
  shown: boolean;
  onShow: () => void;
  onClose: () => void;
};

export default function useDialog(initialState: boolean): DialogFunctionality {
  const [shown, setDialogShown] = useState(initialState);
  const onShow = useCallback(() => {
    if (!shown) {
      setDialogShown(true);
    }
  }, [shown]);

  const onClose = useCallback(() => {
    shown && setDialogShown(false);
  }, [shown]);

  return { shown, onShow, onClose };
}
