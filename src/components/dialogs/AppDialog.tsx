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
  const { dialogShown, sx } = useAppSelector((state) => state.dialogs);
  const DialogComponent = dialogShown ? Dialogs[dialogShown] : null;
  const appInfoDialogSx =
    dialogShown !== 'app-info'
      ? undefined
      : {
          '& .MuiDialog-paper': {
            display: 'flex',
            height: {
              xs: 'calc(100% - 32px)',
              sm: 'calc(100% - 64px)'
            }
          },
          '& .MuiDialogContent-root': {
            flex: '1 1 auto',
            minHeight: 0,
            overflow: 'hidden'
          }
        };
  const onClose = useCallback(() => {
    switch (dialogShown) {
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
  }, [dialogShown]);

  return (
    <Dialog
      onClose={onClose}
      open={Boolean(dialogShown)}
      fullWidth={true}
      maxWidth={'xl'}
      sx={{
        '& .MuiDialogContent-root': { display: 'flex' },
        ...(appInfoDialogSx ?? {}),
        ...(sx ?? {})
      }}
    >
      <DialogContent data-testid='app-dialog'>
        {DialogComponent ? <DialogComponent /> : null}
      </DialogContent>
    </Dialog>
  );
}
