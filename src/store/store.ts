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
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

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
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
type DispatchFunc = () => AppDispatch;
export const useAppDispatch: DispatchFunc = useDispatch;
export type AppThunkDispatch = ThunkDispatch<AppState, unknown, AnyAction>;

export const wrapper = createWrapper<AppStore>(makeStore);
