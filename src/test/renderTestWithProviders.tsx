import { closeDialog } from '@/modules/dialogs/dialogsStore';
import { resetErrorMessages } from '@/modules/error-messages';
import { resetModelData } from '@/modules/model-data/modelDataStore';
import type { ModelDataState } from '@/modules/model-data/modelDataTypes';
import { resetObjectViewer } from '@/modules/object-viewer/objectViewerStore';
import { resetReplaceTexture } from '@/modules/replace-texture';
import useUserTheme from '@/theming/useUserTheme';
import { ThemeProvider } from '@mui/material/styles';
import { render, type RenderOptions } from '@testing-library/react';
import React, { type PropsWithChildren } from 'react';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: { modelData?: ModelDataState };
}
export default function renderTestWithProviders(
  ui: React.ReactElement,
  { preloadedState, ...renderOptions }: ExtendedRenderOptions = {}
) {
  const { modelData } = preloadedState ?? {};

  resetErrorMessages();
  resetReplaceTexture();
  closeDialog();
  resetModelData(modelData);
  resetObjectViewer();
  function Wrapper({ children }: PropsWithChildren) {
    const theme = useUserTheme();
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
  }
  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });
  return { renderResult };
}
