import { hslToRgb, rgbToHsl } from '@/utils/color-conversions';
import { sharedBufferFrom } from '@/utils/data';
import { HslValues } from '@/utils/textures';

export type AdjustTextureHslWorkerPayload = {
  buffer: SharedArrayBuffer;
  hsl: HslValues;
};

export type AdjustTextureHslWorkerResult = SharedArrayBuffer;

export default async function adjustTextureHslWorker({
  hsl,
  buffer
}: AdjustTextureHslWorkerPayload): Promise<AdjustTextureHslWorkerResult> {
  const sourceData = new Uint8Array(buffer);
  const imageData = new Uint8Array(buffer.byteLength);

  /**
   * colors tend to be within ranges, so create a
   * cache of hashed rgba hsl values (`r,g,b`) to
   * value to prevent re-calculation of hsl.
   *
   **/
  const conversions = new Map<number, number>();

  for (let i = 0; i < sourceData.length; i += 4) {
    const rgbHash =
      (sourceData[i] << 16) | (sourceData[i + 1] << 8) | sourceData[i + 2];
    if (!conversions.has(rgbHash)) {
      const { h, s, l } = rgbToHsl(
        sourceData[i],
        sourceData[i + 1],
        sourceData[i + 2]
      );
      const newH = (h + hsl.h + 360) % 360;
      const newS = Math.max(0, Math.min(s + hsl.s, 100));
      const newL = Math.max(0, Math.min(l + hsl.l, 100));
      const { r, g, b } = hslToRgb(newH, newS, newL);

      // Pack RGB into a single 24-bit number
      const packedRgb = (r << 16) | (g << 8) | b;
      conversions.set(rgbHash, packedRgb);
    }

    // Retrieve the packed RGB value
    const packedRgb = conversions.get(rgbHash)!;

    // Unpack the RGB values
    imageData[i] = (packedRgb >> 16) & 0xff; // Red
    imageData[i + 1] = (packedRgb >> 8) & 0xff; // Green
    imageData[i + 2] = packedRgb & 0xff; // Blue
    imageData[i + 3] = sourceData[i + 3]; // Alpha (unchanged)
  }

  return sharedBufferFrom(imageData);
}
