import { createSlice, UnknownAction } from '@reduxjs/toolkit';
import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';
import { castDraft } from 'immer';
import { HYDRATE } from 'next-redux-wrapper';

export type DialogType = 'app-info' | 'replace-texture' | 'file-support-info';

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

const dialogsSlice = createSlice({
  name: 'dialogs',
  initialState: initialDialogsState,
  reducers: {
    showDialog(
      state,
      { payload }: { payload: DialogType | ShowDialogPayload }
    ) {
      if (typeof payload === 'string') {
        state.dialogShown = payload;
        state.sx = undefined;

        return;
      }

      const { type, sx } = payload;

      state.dialogShown = type;
      state.sx = sx ? castDraft(sx) : undefined;
    },

    closeDialog(state) {
      state.dialogShown = undefined;
      state.sx = undefined;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(HYDRATE, (state, { payload }: UnknownAction) =>
      Object.assign(state, payload)
    );
  }
});

export const { showDialog, closeDialog } = dialogsSlice.actions;

export default dialogsSlice;
