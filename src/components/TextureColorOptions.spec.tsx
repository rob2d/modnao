import { screen } from '@testing-library/react';
import renderTestWithProviders from '@/utils/tests/renderTestWithProviders';
import TextureColorOptions from './TextureColorOptions';
import { NLUITextureDef } from '@/types/NLAbstractions';
import { AppState, EditedTexture } from '@/store';
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
});
