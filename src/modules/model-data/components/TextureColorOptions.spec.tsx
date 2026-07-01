import { fireEvent, screen } from '@testing-library/react';
import renderTestWithProviders from '@/utils/tests/renderTestWithProviders';
import TextureColorOptions from './TextureColorOptions';
import type { NLUITextureDef } from '@/types';
import { EditedTexture } from '../modelDataTypes';
import { AppState } from '@/storeTypings';
import { TextureImageBufferKeys } from '@/utils/textures';

const mockTextureState = {
  modelData: {
    models: [],
    textureDefs: [{} as NLUITextureDef],
    editedTextures: {},
    textureHistory: {},
    hasEditedTextures: false,
    isLzssCompressed: false,
    textureFileName: 'hello-world.tex.bin',
    polygonFileName: 'hello-world.pol.bin',
    polygonBufferKey: 'data://anywhere',
    textureBufferKey: 'data://anywhere'
  }
};

describe('TextureColorOptions', () => {
  it('renders with subheader and hsl sliders', async () => {
    const mockEditedTextureState = {
      ...mockTextureState,
      modelData: {
        ...mockTextureState.modelData,
        editedTextures: {
          [0]: {
            width: 0,
            height: 0,
            bufferKeys: {} as TextureImageBufferKeys,
            hsl: {
              h: 0,
              s: 0,
              l: 0
            }
          } as EditedTexture
        }
      }
    } as unknown as AppState;
    renderTestWithProviders(
      <TextureColorOptions textureIndex={0} variant='menu' />,
      { preloadedState: mockEditedTextureState }
    );

    const [subtitleText, hSlider, sSlider, lSlider, applyToAll] =
      await Promise.all([
        screen.findByText('Color Adjustment'),
        screen.findByLabelText('H'),
        screen.findByLabelText('S'),
        screen.findByLabelText('L'),
        screen.findByText('Apply to All')
      ]);

    expect(subtitleText).toBeInTheDocument();
    expect(hSlider).toBeInTheDocument();
    expect(sSlider).toBeInTheDocument();
    expect(lSlider).toBeInTheDocument();
    expect(applyToAll).toBeInTheDocument();
  });

  it('renders a whole-texture toggle when selected UV clip paths are available', async () => {
    renderTestWithProviders(
      <TextureColorOptions
        textureIndex={0}
        variant='menu'
        selectedUvClipPaths={[
          [
            { x: 0, y: 0 },
            { x: 8, y: 0 },
            { x: 0, y: 8 }
          ]
        ]}
      />,
      { preloadedState: mockTextureState as unknown as AppState }
    );

    expect(await screen.findByText('Edit full texture')).toBeInTheDocument();
  });

  it('keeps tab keydown from menu input controls inside the color options', async () => {
    const onKeyDown = jest.fn();

    renderTestWithProviders(
      <div onKeyDown={onKeyDown}>
        <TextureColorOptions textureIndex={0} variant='menu' />
      </div>,
      { preloadedState: mockTextureState as unknown as AppState }
    );

    const [hInput] = await screen.findAllByRole('spinbutton');
    fireEvent.keyDown(hInput, { key: 'Tab' });

    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it('keeps tab keydown from reset controls inside the color options', async () => {
    const onKeyDown = jest.fn();

    renderTestWithProviders(
      <div onKeyDown={onKeyDown}>
        <TextureColorOptions textureIndex={0} variant='menu' />
      </div>,
      { preloadedState: mockTextureState as unknown as AppState }
    );

    fireEvent.keyDown(await screen.findByLabelText('Reset H'), { key: 'Tab' });

    expect(onKeyDown).not.toHaveBeenCalled();
  });
});
