import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { dialogsSlice } from '@/modules/dialogs';
import objectViewerListenerMiddleware from '@/modules/object-viewer/objectViewerListeners';
import objectViewerSlice from '@/modules/object-viewer/objectViewerSlice';
import { modelDataSlice } from '@/modules/model-data';
import { replaceTextureSlice } from '@/modules/replace-texture';
import { errorMessagesSlice } from '@/modules/error-messages';
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
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(objectViewerListenerMiddleware.middleware),
    devTools: process.env.NODE_ENV === 'development'
  });

export const store = setupStore();
export const wrapper = createWrapper<AppStore>(
  setupStore as () => typeof store
);
