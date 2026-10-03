import resourceAttribMappings from '@/constants/resourceAttribMappings';
import { sharedBufferFrom } from '@/utils/data';
import loadTextureFileWorker from './loadTextureFileWorker';
import exportTextureDefRegionWorker from './exportTextureDefRegionWorker';
import exportTextureFileWorker from './exportTextureFileWorker';

describe('MVC2 intro - Cable & Ruby Heart', () => {
  const textureFileType = 'mvc2-intro-cable-ruby';
  const resource = resourceAttribMappings[textureFileType];
  const textureDefs = resource.textureShapesMap!;
  const textureByteLength = 512 * 512 * 2;

  const createSource = () => {
    const source = Buffer.alloc(textureByteLength * 2 + 16, 0xa5);

    for (let i = 0; i < textureByteLength; i++) {
      const word = i < 512 * 512 ? i : ~i;
      source.writeUInt16LE(word & 0xffff, i * 2);
    }

    return source;
  };

  it('loads and exports both raw textures without changing any bytes', async () => {
    const source = createSource();
    const textureBuffer = sharedBufferFrom(source);
    const result = loadTextureFileWorker({
      fileName: 'DM08CAB.BIN',
      textureFileBuffer: textureBuffer,
      textureDefs,
      oobReferenceable: resource.oobReferencable,
      isLzssCompressed: false
    });

    expect(result.isLzssCompressed).toBeUndefined();
    expect(
      result.texturePixelBuffers.map((buffer) => buffer.byteLength)
    ).toEqual([512 * 512 * 4, 512 * 512 * 4, 512 * 512 * 4, 512 * 512 * 4]);

    for (const [index, textureDef] of textureDefs.entries()) {
      await exportTextureDefRegionWorker({
        textureDef,
        textureFileType,
        textureBuffer,
        pixelColors: result.texturePixelBuffers[index * 2 + 1]
      });
    }

    const exported = await exportTextureFileWorker({
      textureFileType,
      textureBuffer,
      isLzssCompressed: false
    });

    expect(Buffer.from(new Uint8Array(exported)).equals(source)).toBe(true);
  });

  it('edits the second texture while preserving the first and trailing bytes', async () => {
    const source = createSource();
    const textureBuffer = sharedBufferFrom(source);
    const pixelColors = new SharedArrayBuffer(512 * 512 * 4);
    const pixels = new Uint8Array(pixelColors);

    for (let offset = 0; offset < pixels.length; offset += 4) {
      pixels.set([255, 0, 0, 255], offset);
    }

    await exportTextureDefRegionWorker({
      textureDef: textureDefs[1],
      textureFileType,
      textureBuffer,
      pixelColors
    });

    const exported = Buffer.from(new Uint8Array(textureBuffer));
    expect(
      exported
        .subarray(0, textureByteLength)
        .equals(source.subarray(0, textureByteLength))
    ).toBe(true);
    expect(
      exported
        .subarray(textureByteLength * 2)
        .equals(source.subarray(textureByteLength * 2))
    ).toBe(true);

    const words = new Uint16Array(textureBuffer, textureByteLength, 512 * 512);
    expect(words.every((word) => word === 0xfc00)).toBe(true);
  });
});
