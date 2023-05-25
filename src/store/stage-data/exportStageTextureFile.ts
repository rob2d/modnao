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

  // rotate canvas
  const rotatedCanvas = document.createElement('canvas');
  const rotatedCtx = rotatedCanvas.getContext('2d') as CanvasRenderingContext2D;
  rotatedCtx.translate(canvas.width / 2, canvas.height / 2);
  rotatedCtx.rotate((90 * Math.PI) / 180);
  rotatedCtx.drawImage(canvas, 0, 0);

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

export default async function exportStageTextureFile(
  textureDefs: NLTextureDef[]
): Promise<void> {
  const { stageTextureFile } = nonSerializables;
  if (!stageTextureFile) {
    return;
  }

  const buffer = Buffer.from(await stageTextureFile.arrayBuffer());

  for await (const t of textureDefs) {
    const { location, width, height } = t;

    // @TODO: determine whether opaque + translucent should always
    // exist for the case of simplicity writing things back
    const pixelColors = await getPixelsFromDataUrlImage(
      t.dataUrls.opaque || t.dataUrls.translucent || ''
    );

    for (let y = 0; y < height; y++) {
      const yOffset = width * y;
      for (let offset = yOffset; offset < yOffset + width; offset++) {
        const [positionX, positionY] = decodeZMortonPosition(offset);
        const decodedOffset = positionY * width + positionX;
        const colorOffset = decodedOffset * 4;
        const color = {
          r: pixelColors[colorOffset],
          g: pixelColors[colorOffset + 1],
          b: pixelColors[colorOffset + 2],
          a: pixelColors[colorOffset + 3]
        };

        const conversionOp = conversionDict[t.colorFormat];
        const offsetWritten = location + decodedOffset * COLOR_SIZE;
        buffer[offsetWritten] = conversionOp(color);
      }
    }

    console.log('colorSet ->', colorSet);
  }

  const output = new Blob([buffer], { type: 'octet-stream' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(output);

  // @TODO: when original filename is available, use that
  // and format as STG{NN}.modnao.BIN
  link.download = 'STG00TEX.modnao.BIN';
  link.click();
}
