import {
  configureStore,
  ThunkAction,
  Action,
  ThunkDispatch,
  AnyAction
} from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import modelViewerSlice from './modelViewerSlice';
import modelDataSlice from './modelDataSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

const store = configureStore({
  reducer: {
    [modelViewerSlice.name]: modelViewerSlice.reducer,
    [modelDataSlice.name]: modelDataSlice.reducer
  },
  devTools: process.env.NODE_ENV === 'development'
});

const makeStore = () => store;

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

export { store };
export const wrapper = createWrapper<AppStore>(makeStore);
