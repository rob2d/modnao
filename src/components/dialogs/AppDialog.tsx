import {
  closeDialog,
  DialogType,
  useAppDispatch,
  useAppSelector
} from '@/store';
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogContent,
  Slide,
  SlideProps,
  Snackbar,
  styled
} from '@mui/material';
import { FC, useCallback, useMemo } from 'react';
import AppInfo from './app-info/AppInfo';
import ReplaceTexture from './replace-texture/ReplaceTexture';
import FileSupportInfo from './file-support-info/FileSupportInfo';
import { dismissError } from '@/store/errorMessagesSlice';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import { usePrevious } from '@uidotdev/usehooks';

const StyledDialog = styled(Dialog)(
  () => `
& .MuiDialogContent-root {
  display: flex;
}`
);

const Dialogs: Record<DialogType, FC> = {
  'app-info': AppInfo,
  'replace-texture': ReplaceTexture,
  'file-support-info': FileSupportInfo
};

export default function AppDialog() {
  const dispatch = useAppDispatch();
  const dialogType = useAppSelector((state) => state.dialogs.dialogShown);
  const Dialog = dialogType ? Dialogs[dialogType] : () => <></>;
  const onClose = useCallback(() => {
    switch (dialogType) {
      // user must explicitly close dialog via content
      // within the dialog for the following types
      case 'replace-texture': {
        break;
      }
      default: {
        dispatch(closeDialog());
        break;
      }
    }
  }, [dialogType]);

  return (
    <StyledDialog
      onClose={onClose}
      open={Boolean(dialogType)}
      fullWidth={true}
      maxWidth='xl'
    >
      <DialogContent data-testid='app-dialog'>
        <Dialog />
      </DialogContent>
    </StyledDialog>
  );
}
