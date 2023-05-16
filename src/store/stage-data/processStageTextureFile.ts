import rgb565ToRgb888 from './process-stage-texture-file/rgb565ToRgb888';
import argb4444ToRgba8888 from './process-stage-texture-file/argb4444toRgba8888';
import decodeZMortonPosition from './process-stage-texture-file/decodeZMortonPosition';
import { NLTextureDef } from '@/types/NLAbstractions';

export default async function processStageTextureFile(
  textureFile: File,
  models: NLModel[],
  textureDefs: NLTextureDef[]
): Promise<{ models: NLModel[]; textureDefs: NLTextureDef[] }> {
  const nextTextureDefs: NLTextureDef[] = [];
  for await (const t of textureDefs) {
    const buffer = Buffer.from(await textureFile.arrayBuffer());
    const canvas = document.createElement('canvas');
    canvas.width = t.width;
    canvas.height = t.height;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    const id = context?.getImageData(0, 0, t.width, t.height) as ImageData;
    const pixels = id.data;

    for (let y = 0; y < t.height; y++) {
      const yOffset = t.width * y;
      for (let offset = yOffset; offset < yOffset + t.width; offset += 1) {
        const offsetDrawn = decodeZMortonPosition(offset - yOffset, y);
        const colorValue = buffer.readUInt16LE(t.location + offsetDrawn * 2);

        let conversionOp!: typeof rgb565ToRgb888 | typeof argb4444ToRgba8888;
        switch (t.colorFormat) {
          case 'RGB565': {
            conversionOp = rgb565ToRgb888;
            break;
          }
          default:
          case 'ARGB4444': {
            conversionOp = argb4444ToRgba8888;
          }
        }

        const color = conversionOp(colorValue);

        const canvasOffset = offset * 4;
        pixels[canvasOffset] = color.r;
        pixels[canvasOffset + 1] = color.g;
        pixels[canvasOffset + 2] = color.b;
        pixels[canvasOffset + 3] = color.a;
      }
    }

    context.putImageData(id, 0, 0);

    const canvas2 = document.createElement('canvas');
    canvas2.width = t.width;
    canvas2.height = t.height;
    const context2 = canvas2.getContext('2d') as CanvasRenderingContext2D;

    context2.translate(canvas.width / 2, canvas.height / 2);
    context2.rotate((-90 * Math.PI) / 180);

    context2.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    const dataUrl = canvas2.toDataURL('image/png');
    nextTextureDefs.push({ ...t, dataUrl });
  }

  // @TODO cross reference texture file buffer stream containing
  // pixel data with pre-loaded models. Model contains texture data

  return Promise.resolve({ models, textureDefs: nextTextureDefs });
}
