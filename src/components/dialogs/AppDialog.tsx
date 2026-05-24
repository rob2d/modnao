import { closeDialog, DialogType } from '@/modules/dialogs';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import { Dialog, DialogContent } from '@mui/material';
import { FC, useCallback } from 'react';
import AppInfo from './app-info/AppInfo';
import { ReplaceTexture } from '@/modules/replace-texture';
import FileSupportInfo from './file-support-info/FileSupportInfo';

const Dialogs: Record<DialogType, FC> = {
  'app-info': AppInfo,
  'replace-texture': ReplaceTexture,
  'file-support-info': FileSupportInfo
};

export default function AppDialog() {
  const dispatch = useAppDispatch();
  const dialogType = useAppSelector((state) => state.dialogs.dialogShown);
  const DialogComponent = dialogType ? Dialogs[dialogType] : null;
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
    <Dialog
      onClose={onClose}
      open={Boolean(dialogType)}
      fullWidth={true}
      maxWidth='xl'
      sx={{ '& .MuiDialogContent-root': { display: 'flex' } }}
    >
      <DialogContent data-testid='app-dialog'>
        {DialogComponent ? <DialogComponent /> : null}
      </DialogContent>
    </Dialog>
  );
}
