import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import { batch, observable } from '@legendapp/state';

export type DialogType =
  | 'app-info'
  | 'replace-texture'
  | 'file-support-info'
  | 'model-data-patch-export';

export interface ShowDialogPayload {
  type: DialogType;
  sx?: SystemStyleObject<Theme>;
}

export const $dialogShown = observable<DialogType | undefined>(undefined);
export const $sx = observable<SystemStyleObject<Theme> | undefined>(undefined);

export function showDialog(payload: DialogType | ShowDialogPayload) {
  batch(() => {
    $dialogShown.set(typeof payload === 'string' ? payload : payload.type);
    $sx.set(typeof payload === 'string' ? undefined : payload.sx);
  });
}

export function closeDialog() {
  batch(() => {
    $dialogShown.set(undefined);
    $sx.set(undefined);
  });
}
