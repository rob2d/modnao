import {
  Action,
  combineReducers,
  configureStore,
  ThunkAction,
  ThunkDispatch,
  UnknownAction
} from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import dialogs from './dialogsSlice';
import objectViewerSlice from './objectViewerSlice';
import modelDataSlice from './modelData/modelDataSlice';
import replaceTextureSlice from './replaceTextureSlice';
import errorMessagesSlice from './errorMessagesSlice';

export const rootReducer = combineReducers({
  [dialogs.name]: dialogs.reducer,
  [objectViewerSlice.name]: objectViewerSlice.reducer,
  [modelDataSlice.name]: modelDataSlice.reducer,
  [replaceTextureSlice.name]: replaceTextureSlice.reducer,
  [errorMessagesSlice.name]: errorMessagesSlice.reducer
});

export const setupStore = (preloadedState?: AppState) =>
  configureStore({
    preloadedState,
    reducer: rootReducer,
    devTools: process.env.NODE_ENV === 'development'
  });

export const store = setupStore();
export type AppStore = ReturnType<typeof setupStore>;
export type AppState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export type AppThunkDispatch = ThunkDispatch<AppState, unknown, UnknownAction>;
export const wrapper = createWrapper<AppStore>(
  setupStore as () => typeof store
);
