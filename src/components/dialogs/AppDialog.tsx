import { useAppDispatch, useAppSelector } from '@/store';
import { closeDialog, DialogType } from '@/store/dialogsSlice';
import { Dialog, DialogContent, styled } from '@mui/material';
import { FC, useCallback } from 'react';
import AppInfo from './app-info/AppInfo';
import FitImage from './fit-image/FitImage';

const StyledDialog = styled(Dialog)(
  () => `
& .MuiDialogContent-root {
  display: flex;
}
`
);

const Dialogs: Record<DialogType, FC> = {
  'app-info': AppInfo,
  'fit-image': FitImage
};

export default function AppDialog() {
  const dispatch = useAppDispatch();
  const dialogType = useAppSelector((state) => state.dialogs.dialogShown);
  const Dialog = dialogType ? Dialogs[dialogType] : () => <></>;
  const onClose = useCallback(() => {
    dispatch(closeDialog());
  }, []);

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
