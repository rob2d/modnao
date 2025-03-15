import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { rootReducer, setupStore } from './store';
import {
  createAsyncThunk,
  ThunkAction,
  ThunkDispatch,
  UnknownAction
} from '@reduxjs/toolkit';

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
type DispatchFunc = () => AppDispatch;
export const useAppDispatch: DispatchFunc = useDispatch;

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: AppState;
  dispatch: AppDispatch;
  rejectValue: string;
}>();

/**
 * more traditional thunk style method to have more
 * fine-tune control over when action dispatches occur
 */
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  UnknownAction
>;

export type AppStore = ReturnType<typeof setupStore>;
export type AppState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunkDispatch = ThunkDispatch<AppState, unknown, UnknownAction>;
