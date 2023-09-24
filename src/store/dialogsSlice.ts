import { AnyAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

export type DialogType = 'app-info' | 'replace-texture' | 'file-support-info';

export interface DialogsState {
  dialogShown?: DialogType;
}

export const initialDialogsState: DialogsState = {
  dialogShown: undefined
};

const dialogsSlice = createSlice({
  name: 'dialogs',
  initialState: initialDialogsState,
  reducers: {
    showDialog(state, action: { payload: DialogType }) {
      state.dialogShown = action.payload;
    },

    closeDialog(state) {
      state.dialogShown = undefined;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(HYDRATE, (state, { payload }: AnyAction) =>
      Object.assign(state, payload)
    );
  }
});

export const { showDialog, closeDialog } = dialogsSlice.actions;

export default dialogsSlice;
