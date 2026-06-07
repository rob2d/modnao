import { fireEvent, screen } from '@testing-library/react';
import renderTestWithProviders from '@/utils/tests/renderTestWithProviders';
import GuiPanel from './GuiPanel';
import type { NLUITextureDef } from '@/types';
import { ModelDataState } from '@/modules/model-data';
import { AppState } from '@/storeTypings';
import SceneOptionsContext, {
  defaultValues
} from '@/contexts/SceneOptionsContext';

const mockState = {
  modelData: {
    models: [],
    textureDefs: [
      {
        bufferKeys: {
          opaque: '',
          transparent: ''
        }
      }
    ] as unknown as NLUITextureDef[],
    editedTextures: {},
    textureHistory: {},
    hasEditedTextures: false,
    isLzssCompressed: false,
    textureFileName: 'hello-world.tex.bin',
    polygonFileName: 'hello-world.pol.bin',
    polygonBufferKey: 'data://anywhere',
    textureBufferKey: 'data://anywhere'
  } as unknown as ModelDataState
} as AppState;

describe('GuiPanel', () => {
  it('renders', async () => {
    renderTestWithProviders(<GuiPanel />, { preloadedState: mockState });

    const elementsFound = await Promise.all([
      screen.findAllByText('Models'),
      screen.findAllByText('hello-world.pol.bin'),
      screen.findAllByText('Textures (1)'),
      screen.findAllByText('hello-world.tex.bin'),
      screen.findAllByText('Scene Options')
    ]);

    for (const elements of elementsFound) {
      expect(elements.length).toBeGreaterThan(0);
    }
  });

  it('exits cinematic mode from collapsed panel resize without changing the saved expansion level', () => {
    const setEnableCinematicMode = jest.fn();
    const setGuiPanelExpansionLevel = jest.fn();
    const { renderResult } = renderTestWithProviders(
      <SceneOptionsContext.Provider
        value={{
          ...defaultValues,
          enableCinematicMode: true,
          guiPanelExpansionLevel: 2,
          setEnableCinematicMode,
          setGuiPanelExpansionLevel
        }}
      >
        <GuiPanel />
      </SceneOptionsContext.Provider>,
      { preloadedState: mockState }
    );

    const panel = renderResult.container.querySelector('.panel');
    const resizeHandle = renderResult.container.querySelector('.resize-handle');

    if (!panel || !resizeHandle) {
      throw new Error(
        'Expected GuiPanel to render the panel and resize handle'
      );
    }

    expect(panel).toHaveClass('collapsed');
    expect(panel).not.toHaveClass('expanded');

    fireEvent.click(resizeHandle);

    expect(setEnableCinematicMode).toHaveBeenCalledWith(false);
    expect(setGuiPanelExpansionLevel).not.toHaveBeenCalled();
  });
});
