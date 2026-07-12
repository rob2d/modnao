import { fireEvent, render, screen } from '@testing-library/react';
import GuiPanelTextureMenu from './GuiPanelTextureMenu';

jest.mock('@/modules/model-data', () => ({
  TextureColorOptions: () => null,
  useTextureOptions: () => [
    {
      label: 'Crop/rotate',
      icon: null,
      tooltip: 'Open image replace dialog with existing image',
      onClick: jest.fn()
    }
  ]
}));

describe('GuiPanelTextureMenu', () => {
  it('keeps tab keydown from texture menu items inside the menu', async () => {
    const anchorEl = document.createElement('button');
    document.body.appendChild(anchorEl);

    render(
      <GuiPanelTextureMenu
        textureIndex={0}
        pixelBufferKeys={{ opaque: '', translucent: '' }}
        selectedUvClipPaths={[]}
        onReplaceImageFile={jest.fn()}
        anchorEl={anchorEl}
        open
        onClose={jest.fn()}
      />
    );

    const cropRotateItem = await screen.findByText('Crop/rotate');
    fireEvent.keyDown(cropRotateItem, { key: 'Tab' });

    expect(screen.getByText('Crop/rotate')).toBeInTheDocument();
  });
});
