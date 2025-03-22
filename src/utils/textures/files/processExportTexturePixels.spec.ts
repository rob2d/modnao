import { TextureColorFormat } from '../TextureColorFormat';
import processExportTexturePixels from './processExportTexturePixels';

it('should correctly process RGB565 pixel colors and write to the texture buffer', () => {
  const pixelColors = new Uint8Array([
    0xff, 0x00, 0x32, 0x04, 0x08, 0xff, 0x00, 0xff
  ]);

  const width = 2;
  const height = 2;
  const baseLocation = 0;
  const ramOffset = 0;
  const colorFormat: TextureColorFormat = 'RGB565';
  const textureBuffer = Buffer.alloc(6);

  processExportTexturePixels({
    pixelColors,
    width,
    height,
    baseLocation,
    ramOffset,
    colorFormat,
    textureBuffer
  });

  expect(textureBuffer).toEqual(
    Buffer.from(new Uint8Array([6, 248, 224, 15, 0, 0]))
  );
});
