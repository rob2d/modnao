import loadImageFromDataUrl from '@/utils/images/loadImageFromDataUrl';
import nonSerializables from '../nonSerializables';

export default async function storeSourceTextureData(
  dataUrl: string,
  textureIndex: number
) {
  const image = await loadImageFromDataUrl(dataUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const width = image.width;
  const height = image.height;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);

  ctx.translate(canvas.width / 2, canvas.height / 2);

  ctx.rotate((90 * Math.PI) / 180);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  const imageData = ctx.getImageData(0, 0, width, height);

  // @TODO process both translucent and opaque data variants
  nonSerializables.sourceTextureData[textureIndex] = {
    opaque: imageData,
    translucent: imageData
  };
}
