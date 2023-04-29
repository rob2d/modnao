import {
  configureStore,
  ThunkAction,
  Action,
  ThunkDispatch,
  AnyAction
} from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import modelViewerSlice from './modelViewerSlice';
import stageDataSlice from './stageDataSlice';

const makeStore = () =>
  configureStore({
    reducer: {
      [modelViewerSlice.name]: modelViewerSlice.reducer,
      [stageDataSlice.name]: stageDataSlice.reducer
    },
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

export type AppThunkDispatch = ThunkDispatch<AppState, any, AnyAction>;

export const wrapper = createWrapper<AppStore>(makeStore);
