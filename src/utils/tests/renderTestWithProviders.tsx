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

export default function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {} as AppState,
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
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

  function Wrapper({ children }: PropsWithChildren<unknown>): JSX.Element {
    return (
      <Provider store={store}>
        <ThemedContent>{children}</ThemedContent>
      </Provider>
    );
  }

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
