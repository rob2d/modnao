import { encodeZMortonPosition } from '@/utils/textures/parse';
import { NLTextureDef, TextureDataUrlType } from '@/types/NLAbstractions';
import {
  argb1555ToRgba8888,
  argb4444ToRgba8888,
  rgb565ToRgba8888
} from '@/utils/color-conversions';
import { RgbaColor, TextureColorFormat } from '@/utils/textures';
import { SourceTextureData } from '../SourceTextureData';
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

export default async function processTextureBuffer(
  bufferPassed: Buffer,
  textureDefs: NLTextureDef[]
): Promise<{
  textureDefs: NLTextureDef[];
  sourceTextureData: SourceTextureData[];
}> {
  const buffer = Buffer.from(bufferPassed);
  const nextTextureDefs: NLTextureDef[] = [];
  const sourceTextureData: SourceTextureData[] = [];

  let i = 0;
  for (const t of textureDefs) {
    const urlTypes = Object.keys(t.bufferUrls) as TextureDataUrlType[];
    const updatedTexture = { ...t };

    for (const objectUrlType of urlTypes) {
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

      /* @TODO: add this to part of return
       * for assignment on main UI thread
       */
      sourceTextureData[i] = sourceTextureData[i] || {
        translucent: undefined,
        opaque: undefined
      };

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
    textureDefs: nextTextureDefs,
    sourceTextureData
  };
}
