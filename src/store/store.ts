import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { dialogsSlice } from './dialogs';
import { objectViewerSlice } from './objectViewer';
import modelDataSlice from './modelData/modelDataSlice';
import { replaceTextureSlice } from './replaceTexture';
import { errorMessagesSlice } from './errorMessages';
import { AppState, AppStore } from './storeTypings';

export const rootReducer = combineReducers({
  [dialogsSlice.name]: dialogsSlice.reducer,
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
export const wrapper = createWrapper<AppStore>(
  setupStore as () => typeof store
);
