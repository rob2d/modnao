import loadImageFromDataUrl from '@/utils/images/loadImageFromDataUrl';
import nonSerializables from '../nonSerializables';

export default async function storeSourceTextureData(
  dataUrls: { opaque?: string; translucent?: string },
  textureIndex: number
) {
  for (const [, dataUrl] of Object.entries(dataUrls)) {
    const image = await loadImageFromDataUrl(dataUrl);
    const canvas = document.createElement('canvas');
    const width = image.width;
    const height = image.height;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, width, height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    const createdData = await createImageBitmap(imageData);
    ctx.drawImage(createdData, -canvas.width / 2, -canvas.height / 2);
    const rotatedImageData = ctx.getImageData(0, 0, width, height);

    // @TODO process both translucent and opaque data variants
    nonSerializables.sourceTextureData[textureIndex] = {
      opaque: rotatedImageData,
      translucent: rotatedImageData
    };
  }
}
