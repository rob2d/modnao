import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import { batch, signal } from '@preact-signals/safe-react';

export type DialogType =
  | 'app-info'
  | 'replace-texture'
  | 'file-support-info'
  | 'model-data-patch-export';

export interface ShowDialogPayload {
  type: DialogType;
  sx?: SystemStyleObject<Theme>;
}

export const $dialogShown = signal<DialogType | undefined>(undefined);
export const $sx = signal<SystemStyleObject<Theme> | undefined>(undefined);

export function showDialog(payload: DialogType | ShowDialogPayload) {
  batch(() => {
    $dialogShown.value = typeof payload === 'string' ? payload : payload.type;
    $sx.value = typeof payload === 'string' ? undefined : payload.sx;
  });
}

export function closeDialog() {
  batch(() => {
    $dialogShown.value = undefined;
    $sx.value = undefined;
  });
}
