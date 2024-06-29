import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from './store';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
type DispatchFunc = () => AppDispatch;
export const useAppDispatch: DispatchFunc = useDispatch;

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: AppState;
  dispatch: AppDispatch;
  rejectValue: string;
}>();
