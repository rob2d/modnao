import React, { PropsWithChildren, useContext } from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { PreloadedState } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';

import useUserTheme from '@/theming/useUserTheme';
import { type AppState, type AppStore, setupStore } from '@/store';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<AppState>;
  store?: AppStore;
}

const defaultAppState = {};

export default function renderTestWIthProviders(
  ui: React.ReactElement,
  {
    preloadedState = defaultAppState as AppState,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function ThemedContent({
    children
  }: PropsWithChildren<unknown>): JSX.Element {
    const viewOptions = useContext(ViewOptionsContext);
    const theme = useUserTheme(
      viewOptions.scenePalette || {},
      viewOptions.themeKey
    );
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
  }

  let store: ReturnType<typeof setupStore> | undefined;

  if (preloadedState) {
    store = setupStore(preloadedState);
  }

  function AppStateWrapper({
    children
  }: PropsWithChildren<unknown>): JSX.Element {
    return (
      <Provider store={store as ReturnType<typeof setupStore>}>
        <ThemedContent>{children}</ThemedContent>
      </Provider>
    );
  }

  function Wrapper({ children }: PropsWithChildren<unknown>): JSX.Element {
    return <ThemedContent>{children}</ThemedContent>;
  }

  const wrapper = store ? AppStateWrapper : Wrapper;

  const renderResult = render(ui, { wrapper, ...renderOptions });

  // Return an object with the store and all of RTL's query functions
  return { store, renderResult };
}
