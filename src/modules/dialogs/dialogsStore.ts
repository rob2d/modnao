import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import { signal } from '@preact-signals/safe-react';

export type DialogType =
  | 'app-info'
  | 'replace-texture'
  | 'file-support-info'
  | 'model-data-patch-export';

export interface ShowDialogPayload {
  type: DialogType;
  sx?: SystemStyleObject<Theme>;
}

export interface DialogsState {
  dialogShown?: DialogType;
  sx?: SystemStyleObject<Theme>;
}

export const initialDialogsState: DialogsState = {
  dialogShown: undefined
};

export const $dialogs = signal<DialogsState>(initialDialogsState);

export function showDialog(payload: DialogType | ShowDialogPayload) {
  $dialogs.value =
    typeof payload === 'string'
      ? { dialogShown: payload, sx: undefined }
      : { dialogShown: payload.type, sx: payload.sx };
}

export function closeDialog() {
  $dialogs.value = { dialogShown: undefined, sx: undefined };
}
