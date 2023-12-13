import { AnyAction, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

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
    builder.addCase(HYDRATE, (state, { payload }: AnyAction) =>
      Object.assign(state, payload)
    );
  }
});

export const { showError, dismissError } = errorMessagesSlice.actions;

export default errorMessagesSlice;
