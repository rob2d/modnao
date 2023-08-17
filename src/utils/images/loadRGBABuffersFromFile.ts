import { Image } from 'image-js';

export default async function loadRGBABuffersFromFile(
  file: File
): Promise<
  [
    Uint8ClampedArray | Uint8Array,
    Uint8ClampedArray | Uint8Array,
    number,
    number
  ]
> {
  const arrayBuffer = await file.arrayBuffer();
  const image = await Image.load(arrayBuffer);

  const translucentBuffer = image.getRGBAData();

  const opaqueBuffer = new Uint8ClampedArray(Buffer.from(translucentBuffer));

  for (let i = 0; i < translucentBuffer.length; i += 4) {
    opaqueBuffer[i] = translucentBuffer[i];
    opaqueBuffer[i + 1] = translucentBuffer[i + 1];
    opaqueBuffer[i + 2] = translucentBuffer[i + 2];
    opaqueBuffer[i + 3] = 255;
  }

  return [translucentBuffer, opaqueBuffer, image.width, image.height];
}
