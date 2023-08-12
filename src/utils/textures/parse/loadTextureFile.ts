import {
  decompressTextureBuffer,
  encodeZMortonPosition
} from '@/utils/textures/parse';
import { NLTextureDef, TextureDataUrlType } from '@/types/NLAbstractions';
import {
  argb1555ToRgba8888,
  argb4444ToRgba8888,
  rgb565ToRgba8888
} from '@/utils/color-conversions';
import { RgbaColor, TextureColorFormat } from '@/utils/textures';
import { bufferToObjectUrl } from '@/utils/data';

const COLOR_SIZE = 2;

const unsupportedConversion = () => ({ r: 0, g: 0, b: 0, a: 0 });
const conversionDict: Record<TextureColorFormat, (color: number) => RgbaColor> =
  {
    RGB565: rgb565ToRgba8888,
    ARGB1555: argb1555ToRgba8888,
    ARGB4444: argb4444ToRgba8888,
    RGB555: unsupportedConversion,
    ARGB8888: unsupportedConversion
  };

async function loadTextureBuffer(
  bufferPassed: Buffer,
  textureDefs: NLTextureDef[]
): Promise<{ textureDefs: NLTextureDef[] }> {
  const buffer = Buffer.from(bufferPassed);
  const nextTextureDefs: NLTextureDef[] = [];

  let i = 0;
  for await (const t of textureDefs) {
    const urlTypes = Object.keys(t.bufferUrls) as TextureDataUrlType[];
    const updatedTexture = { ...t };

    for await (const objectUrlType of urlTypes) {
      const pixels = new Uint8ClampedArray(t.width * t.height * 4);

      for (let y = 0; y < t.height; y++) {
        const yOffset = t.width * y;

        for (let offset = yOffset; offset < yOffset + t.width; offset += 1) {
          const offsetDrawn = encodeZMortonPosition(offset - yOffset, y);
          const readOffset =
            t.baseLocation - t.ramOffset + offsetDrawn * COLOR_SIZE;
          // textures may point out of bounds (this would be
          // to RAM elswhere in-game)
          if (readOffset >= buffer.length) {
            break;
          }

          const colorValue = buffer.readUInt16LE(readOffset);
          const conversionOp = conversionDict[t.colorFormat];
          const color = conversionOp(colorValue);

          const canvasOffset = offset * 4;
          pixels[canvasOffset] = color.r;
          pixels[canvasOffset + 1] = color.g;
          pixels[canvasOffset + 2] = color.b;
          pixels[canvasOffset + 3] =
            objectUrlType === 'translucent' ? color.a : 255;
        }
      }

      const objectUrl = await bufferToObjectUrl(pixels);

      updatedTexture.bufferUrls = {
        ...updatedTexture.bufferUrls,
        [objectUrlType]: objectUrl
      };
    }

    nextTextureDefs.push(updatedTexture);
    i++;
  }

  return {
    textureDefs: nextTextureDefs
  };
}

export default async function loadTextureFile({
  buffer,
  textureDefs,
  fileName
}: {
  textureDefs: NLTextureDef[];
  fileName: string;
  buffer: Buffer;
}) {
  let result: {
    textureDefs: NLTextureDef[];
    fileName: string;
    hasCompressedTextures: boolean;
    textureBufferUrl: string;
  };

  try {
    const textureBufferData = await loadTextureBuffer(buffer, textureDefs);
    const textureBufferUrl = await bufferToObjectUrl(buffer);

    result = {
      textureBufferUrl: textureBufferUrl,
      hasCompressedTextures: false,
      fileName,
      ...textureBufferData
    };
  } catch (error) {
    // if an overflow error occurs, this is an indicator that the
    // file loaded is compressed; this is common for certain
    // game texture formats like Capcom vs SNK 2

    if (!(error instanceof RangeError)) {
      throw error;
    }

    const decompressedBuffer = decompressTextureBuffer(buffer);

    const textureBufferData = await loadTextureBuffer(
      decompressedBuffer,
      textureDefs
    );

    result = {
      textureBufferUrl: await bufferToObjectUrl(decompressedBuffer),
      fileName,
      hasCompressedTextures: true,
      ...textureBufferData
    };
  }

  return result;
}
