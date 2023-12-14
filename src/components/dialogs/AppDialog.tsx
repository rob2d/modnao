import {
  closeDialog,
  DialogType,
  useAppDispatch,
  useAppSelector
} from '@/store';
import { Dialog, DialogContent, styled } from '@mui/material';
import { FC, useCallback } from 'react';
import AppInfo from './app-info/AppInfo';
import ReplaceTexture from './replace-texture/ReplaceTexture';
import FileSupportInfo from './file-support-info/FileSupportInfo';

const StyledDialog = styled(Dialog)(
  () => `
& .MuiDialogContent-root {
  display: flex;
}`
);

const ErrorDialog = () => {
  const error = useAppSelector(
    (s) =>
      s.errorMessages.messages[s.errorMessages.messages.length - 1] ?? undefined
  );

  if (!error) {
    return <></>;
  }

  const { title, message } = error;
  return (
    <div>
      <div>{title}</div>
      <div>{message}</div>
    </div>
  );
};

const Dialogs: Record<DialogType, FC> = {
  'app-info': AppInfo,
  'replace-texture': ReplaceTexture,
  'file-support-info': FileSupportInfo,
  'error-message': ErrorDialog
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
