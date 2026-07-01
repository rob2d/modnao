import { hslToRgb, rgbToHsl } from '@/utils/color-conversions';
import { sharedBufferFrom } from '@/utils/data';
import { HslValues } from '@/utils/textures';

export type AdjustTextureHslWorkerPayload = {
  buffer: SharedArrayBuffer;
  hsl: HslValues;
  uvPixelByteIndexes?: number[];
};

export type AdjustTextureHslWorkerResult = SharedArrayBuffer;

export default async function adjustTextureHslWorker({
  hsl,
  buffer,
  uvPixelByteIndexes = []
}: AdjustTextureHslWorkerPayload): Promise<AdjustTextureHslWorkerResult> {
  const sourceData = new Uint8Array(buffer);
  const imageData = new Uint8Array(buffer.byteLength);

  /**
   * texture colors repeat heavily, so cache RGB -> adjusted RGB conversions
   * while preserving alpha byte-for-byte.
   */
  const conversions = new Map<number, number>();

  const adjustPixel = (byteIndex: number) => {
    const rgbHash =
      (sourceData[byteIndex] << 16) |
      (sourceData[byteIndex + 1] << 8) |
      sourceData[byteIndex + 2];

    if (!conversions.has(rgbHash)) {
      const { h, s, l } = rgbToHsl(
        sourceData[byteIndex],
        sourceData[byteIndex + 1],
        sourceData[byteIndex + 2]
      );
      const newH = (h + hsl.h + 360) % 360;
      const newS = Math.max(0, Math.min(s + hsl.s, 100));
      const newL = Math.max(0, Math.min(l + hsl.l, 100));
      const { r, g, b } = hslToRgb(newH, newS, newL);

      const packedRgb = (r << 16) | (g << 8) | b;
      conversions.set(rgbHash, packedRgb);
    }

    const packedRgb = conversions.get(rgbHash)!;

    imageData[byteIndex] = (packedRgb >> 16) & 0xff;
    imageData[byteIndex + 1] = (packedRgb >> 8) & 0xff;
    imageData[byteIndex + 2] = packedRgb & 0xff;
    imageData[byteIndex + 3] = sourceData[byteIndex + 3];
  };

  if (!uvPixelByteIndexes.length) {
    for (let byteIndex = 0; byteIndex < sourceData.length; byteIndex += 4) {
      adjustPixel(byteIndex);
    }

    return sharedBufferFrom(imageData);
  }

  imageData.set(sourceData);

  uvPixelByteIndexes.forEach((byteIndex) => {
    adjustPixel(byteIndex);
  });

  return sharedBufferFrom(imageData);
}
