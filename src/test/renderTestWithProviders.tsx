import { resetObjectViewer } from '@/modules/object-viewer/objectViewerStore';
import { type AppState, resetState } from '@/store';
import useUserTheme from '@/theming/useUserTheme';
import { ThemeProvider } from '@mui/material/styles';
import { render, type RenderOptions } from '@testing-library/react';
import React, { type PropsWithChildren } from 'react';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<AppState>;
}
export default function renderTestWithProviders(
  ui: React.ReactElement,
  { preloadedState, ...renderOptions }: ExtendedRenderOptions = {}
) {
  resetState(preloadedState);
  resetObjectViewer();
  function Wrapper({ children }: PropsWithChildren) {
    const theme = useUserTheme();
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
  }
  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });
  return { renderResult };
}
