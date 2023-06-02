import { NLTextureDef } from '@/types/NLAbstractions';
import nonSerializables from '../nonSerializables';
import decodeZMortonPosition from '@/utils/textures/serialize/decodeZMortonPosition';
import rgbaToRgb565 from '@/utils/textures/serialize/rgbaToRgb565';
import rgbaToArgb1555 from '@/utils/textures/serialize/rgbaToArgb1555';
import rgbaToArgb4444 from '@/utils/textures/serialize/rgbaToArgb4444';
import { RgbaColor, TextureColorFormat } from '@/utils/textures';
import loadImageFromDataUrl from '@/utils/images/loadImageFromDataUrl';

/**
 * gets rotated pixels from a provided dataUrl string
 */
async function getPixelsFromDataUrlImage(dataUrl: string) {
  const image = await loadImageFromDataUrl(dataUrl);
  const canvas = document.createElement('canvas');
  const width = image.width;
  const height = image.height;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.drawImage(image, 0, 0);

  const rotatedCanvas = document.createElement('canvas');
  rotatedCanvas.width = width;
  rotatedCanvas.height = height;
  const rotatedCtx = rotatedCanvas.getContext('2d') as CanvasRenderingContext2D;
  rotatedCtx.translate(canvas.width / 2, canvas.height / 2);

  rotatedCtx.rotate((90 * Math.PI) / 180);
  rotatedCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  const imageData = rotatedCtx.getImageData(0, 0, width, height);
  return imageData.data;
}

const COLOR_SIZE = 2;

const conversionDict: Record<TextureColorFormat, (color: RgbaColor) => number> =
  {
    RGB565: rgbaToRgb565,
    ARGB1555: rgbaToArgb1555,
    ARGB4444: rgbaToArgb4444,
    RGB555: () => 0,
    ARGB8888: () => 0
  };

export default async function exportTextureFile(
  textureDefs: NLTextureDef[],
  textureFileName = ''
): Promise<void> {
  const { textureFile } = nonSerializables;
  if (!textureFile) {
    return;
  }

  const buffer = Buffer.from(await textureFile.arrayBuffer());

  for await (const t of textureDefs) {
    const { baseLocation, ramOffset, width, height } = t;

    const pixelColors = await getPixelsFromDataUrlImage(t.dataUrls.translucent);

    for (let y = 0; y < height; y++) {
      const yOffset = width * y;
      for (let offset = yOffset; offset < yOffset + width; offset++) {
        const [positionX, positionY] = decodeZMortonPosition(offset);
        const positionOffset = positionY * width + positionX;
        const colorOffset = positionOffset * 4;
        const color = {
          r: pixelColors[colorOffset],
          g: pixelColors[colorOffset + 1],
          b: pixelColors[colorOffset + 2],
          a: pixelColors[colorOffset + 3]
        };

        const conversionOp = conversionDict[t.colorFormat];
        const offsetWritten = baseLocation - ramOffset + offset * COLOR_SIZE;

        buffer.writeUInt16LE(conversionOp(color), offsetWritten);
      }
    }
  }

  const output = new Blob([buffer], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(output);

  const name = textureFileName.substring(0, textureFileName.lastIndexOf('.'));

  const extension = textureFileName.substring(
    textureFileName.lastIndexOf('.') + 1
  );
  link.download = `${name}.modnao.${extension}`;
  link.click();
}
