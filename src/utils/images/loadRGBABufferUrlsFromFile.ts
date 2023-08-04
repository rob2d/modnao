import 'jimp';
import Jimp from 'jimp';
import { bufferToObjectUrl } from '../data';
import { SourceTextureData } from '../textures/SourceTextureData';

export default async function loadRGBABufferUrlsFromFile(
  file: File
): Promise<SourceTextureData> {
  const reader = new FileReader();
  const result: SourceTextureData = await new Promise((resolve) => {
    reader.onload = async (event) => {
      if (
        !event ||
        !event.target ||
        !(event.target.result instanceof ArrayBuffer)
      ) {
        return;
      }
      const arrayBuffer = event.target.result;

      const img = await Jimp.read(arrayBuffer as any);
      const translucentBuffer = new Uint8ClampedArray(img.bitmap.data);

      const opaqueBuffer = new Uint8ClampedArray(
        Buffer.from(translucentBuffer)
      );
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

      resolve({ translucent, opaque });
    };

    reader.readAsArrayBuffer(file);
  });

  return result;
}
