import { useAppDispatch, useAppSelector } from '@/store';
import { closeDialog, DialogType } from '@/store/dialogsSlice';
import { Dialog, DialogContent, styled } from '@mui/material';
import { FC, useCallback } from 'react';
import AppInfo from './app-info/AppInfo';
import ReplaceTexture from './replace-texture/ReplaceTexture';
import FileSupportInfo from './file-support-info/FileSupportInfo';

const StyledDialog = styled(Dialog)(
  () => `
& .MuiDialogContent-root {
  display: flex;
}
`
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
      <DialogContent>
        <Dialog />
      </DialogContent>
    </StyledDialog>
  );
}
