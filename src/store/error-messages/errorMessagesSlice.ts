import { createSlice, UnknownAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { JSX } from 'react';

export const sliceName = 'errorMessages';

export interface ErrorMessage {
  title: string;
  message: JSX.Element | string;
}

export interface ErrorMessagesState {
  messages: ErrorMessage[];
}

export const initialErrorMessagesState: ErrorMessagesState = {
  messages: []
};

// NOTE: when working with error messages, the dialog state
// is a simple variable tracking which dialog is open,
// so if we need anything more complex within dialogs e.g.
// non-trivial functionality with full errors that should be revisited
// to be a stack or other meaningful DS

const errorMessagesSlice = createSlice({
  name: sliceName,
  initialState: initialErrorMessagesState,
  reducers: {
    showError(state, { payload }: { payload: ErrorMessage }) {
      state.messages.push(payload);
    },
    dismissError(state) {
      state.messages.pop();
    }
  },
  extraReducers: (builder) => {
    builder.addCase(HYDRATE, (state, { payload }: UnknownAction) =>
      Object.assign(state, payload)
    );
  }
});

export const { showError, dismissError } = errorMessagesSlice.actions;

export default errorMessagesSlice;
