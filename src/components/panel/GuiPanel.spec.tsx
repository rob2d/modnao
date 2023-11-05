import { screen } from '@testing-library/react';
import renderTestWithProviders from '@/utils/tests/renderTestWithProviders';
import GuiPanel from './GuiPanel';
import { NLTextureDef } from '@/types/NLAbstractions';

const mockState = {
  modelData: {
    models: [],
    textureDefs: [
      {
        dataUrls: {
          opaque: '',
          transparent: ''
        },
        bufferUrls: {
          opaque: '',
          transparent: ''
        }
      }
    ] as unknown as NLTextureDef[],
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

describe('GuiPanel', () => {
  it('renders', async () => {
    renderTestWithProviders(<GuiPanel />, { preloadedState: mockState });

    const elementsFound = await Promise.all([
      screen.findAllByText('Models'),
      screen.findAllByText('hello-world.pol.bin'),
      screen.findAllByText('Textures (1)'),
      screen.findAllByText('hello-world.tex.bin'),
      screen.findAllByText('View Options')
    ]);

    for (const elements of elementsFound) {
      expect(elements.length).toBeGreaterThan(0);
    }
  });
});
