import {
  rgb565ToRgba8888,
  argb1555ToRgba8888,
  argb4444ToRgba8888,
  encodeZMortonPosition
} from '@/utils/textures/parse';
import { NLTextureDef, TextureDataUrlType } from '@/types/NLAbstractions';
import { RgbaColor, TextureColorFormat } from '@/utils/textures';
import nonSerializables from '../nonSerializables';
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

export default async function processTextureFile(
  textureFile: File,
  models: NLModel[],
  textureDefs: NLTextureDef[]
): Promise<{
  models: NLModel[];
  textureDefs: NLTextureDef[];
  fileName: string;
}> {
  const nextTextureDefs: NLTextureDef[] = [];

  const buffer = Buffer.from(await textureFile.arrayBuffer());

  for await (const t of textureDefs) {
    const dataUrlTypes = Object.keys(t.dataUrls) as TextureDataUrlType[];
    const updatedTexture = { ...t };

    for await (const dataUrlType of dataUrlTypes) {
      const canvas = document.createElement('canvas');
      canvas.width = t.width;
      canvas.height = t.height;

      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      const id = context.getImageData(0, 0, t.width, t.height) as ImageData;
      const pixels = id.data;

      for (let y = 0; y < t.height; y++) {
        const yOffset = t.width * y;

        for (let offset = yOffset; offset < yOffset + t.width; offset += 1) {
          const offsetDrawn = encodeZMortonPosition(offset - yOffset, y);
          const colorValue = buffer.readUInt16LE(
            t.baseLocation - t.ramOffset + offsetDrawn * COLOR_SIZE
          );

          const conversionOp = conversionDict[t.colorFormat];

          const color = conversionOp(colorValue);

          const canvasOffset = offset * 4;
          pixels[canvasOffset] = color.r;
          pixels[canvasOffset + 1] = color.g;
          pixels[canvasOffset + 2] = color.b;
          pixels[canvasOffset + 3] =
            dataUrlType === 'translucent' ? color.a : 255;
        }
      }

      context.putImageData(id, 0, 0);

      const canvas2 = document.createElement('canvas');
      canvas2.width = canvas.width;
      canvas2.height = canvas.height;

      const context2 = canvas2.getContext('2d') as CanvasRenderingContext2D;
      context2.translate(canvas.width / 2, canvas.height / 2);
      context2.rotate((-90 * Math.PI) / 180);
      context2.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

      const dataUrl = canvas2.toDataURL('image/png');
      updatedTexture.dataUrls = {
        ...updatedTexture.dataUrls,
        [dataUrlType]: dataUrl
      };
    }

    nextTextureDefs.push(updatedTexture);
  }

  nonSerializables.textureFile = textureFile;

  return Promise.resolve({
    models,
    textureDefs: nextTextureDefs,
    fileName: textureFile.name
  });
}
