import { screen } from '@testing-library/react';
import renderTestWithProviders from '@/utils/tests/renderTestWithProviders';
import TextureColorOptions from './TextureColorOptions';
import { NLTextureDef } from '@/types/NLAbstractions';
import { EditedTexture } from '@/store';
import { SourceTextureData } from '@/utils/textures';

const mockTextureState = {
  modelData: {
    models: [],
    textureDefs: [{} as NLTextureDef],
    editedTextures: {},
    textureHistory: {},
    hasEditedTextures: false,
    hasCompressedTextures: false,
    textureFileName: 'hello-world.tex.bin',
    polygonFileName: 'hello-world.pol.bin',
    polygonBufferUrl: 'data://anywhere',
    textureBufferUrl: 'data://anywhere'
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
            bufferUrls: {} as SourceTextureData,
            dataUrls: {} as SourceTextureData,
            hsl: {
              h: 0,
              s: 0,
              l: 0
            }
          } as EditedTexture
        }
      }
    };
    renderTestWithProviders(
      <TextureColorOptions textureIndex={0} variant='menu' />,
      { preloadedState: mockEditedTextureState }
    );

    const [subtitleText, hSlider, sSlider, lSlider, applyToAll] =
      await Promise.all([
        screen.getByText('Color Adjustment'),
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
