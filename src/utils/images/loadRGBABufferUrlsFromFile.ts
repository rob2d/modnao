import { Image } from 'image-js';
import { bufferToObjectUrl } from '../data';
import { SourceTextureData } from '../textures/SourceTextureData';

export default async function loadRGBABufferUrlsFromFile(
  file: File
): Promise<SourceTextureData> {
  const arrayBuffer = await file.arrayBuffer();
  const image = await Image.load(arrayBuffer);

  const translucentBuffer = image.getRGBAData();

  const opaqueBuffer = Buffer.from(translucentBuffer);

  for (let i = 0; i < translucentBuffer.length; i += 4) {
    opaqueBuffer[i] = translucentBuffer[i];
    opaqueBuffer[i + 1] = translucentBuffer[i + 1];
    opaqueBuffer[i + 2] = translucentBuffer[i + 2];
    opaqueBuffer[i + 3] = 255;
  }

  const [translucent, opaque] = await Promise.all([
    await bufferToObjectUrl(translucentBuffer),
    await bufferToObjectUrl(opaqueBuffer)
  ]);

  return {
    translucent,
    opaque
  };
}
