import { createSlice, UnknownAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

export type DialogType = 'app-info' | 'replace-texture' | 'file-support-info';

export interface ShowDialogPayload {
  type: DialogType;
  width?: string;
}

export interface DialogsState {
  dialogShown?: DialogType;
  width?: string;
}

export const initialDialogsState: DialogsState = {
  dialogShown: undefined
};

const dialogsSlice = createSlice({
  name: 'dialogs',
  initialState: initialDialogsState,
  reducers: {
    showDialog(state, action: { payload: DialogType | ShowDialogPayload }) {
      if (typeof action.payload === 'string') {
        state.dialogShown = action.payload;
        state.width = undefined;

        return;
      }

      state.dialogShown = action.payload.type;
      state.width = action.payload.width;
    },

    closeDialog(state) {
      state.dialogShown = undefined;
      state.width = undefined;
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
