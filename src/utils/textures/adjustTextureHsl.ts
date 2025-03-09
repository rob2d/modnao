import { HslValues } from './HslValues';
import { RgbaColor } from './RgbaColor';
import { hslToRgb, rgbToHsl } from '../color-conversions';

export default async function adjustTextureHsl(
  buffer: SharedArrayBuffer,
  hsl: HslValues
) {
  const sourceData = new Uint8Array(buffer);
  const imageData = new Uint8Array(buffer.byteLength);

  /**
   * colors tend to be within ranges, so create a
   * cache of hashed rgba hsl values (`r,g,b`) to
   * value to prevent re-calculation of hsl.
   *
   **/
  const conversions = new Map<number, { r: number; g: number; b: number }>();

  for (let i = 0; i < sourceData.length; i += 4) {
    const rgbHash =
      (sourceData[i] << 16) | (sourceData[i + 1] << 8) | sourceData[i + 2];
    if (!conversions.has(rgbHash)) {
      const { h, s, l } = rgbToHsl(
        sourceData[i],
        sourceData[i + 1],
        sourceData[i + 2]
      );
      const newH = (h + hsl.h) % 360;
      const newS = Math.max(Math.min(s + hsl.s, 100), 0);
      const newL = Math.max(Math.min(l + hsl.l, 100), 0);
      const { r: newR, g: newG, b: newB } = hslToRgb(newH, newS, newL);
      conversions.set(rgbHash, { r: newR, g: newG, b: newB });
    }
    const newRgba = conversions.get(rgbHash) as RgbaColor;

    imageData[i] = newRgba.r;
    imageData[i + 1] = newRgba.g;
    imageData[i + 2] = newRgba.b;
    imageData[i + 3] = sourceData[i + 3];
  }

  return imageData;
}
