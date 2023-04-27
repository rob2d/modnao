import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { modelViewerSlice } from './modelViewerSlice';

const makeStore = () =>
  configureStore({
    reducer: { [modelViewerSlice.name]: modelViewerSlice.reducer },
    devTools: process.env.NODE_ENV === 'development'
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<AppStore>(makeStore);
