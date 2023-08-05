import adjustHslOfRgba from '../color-conversions/adjustHslOfRgba';
import { bufferToObjectUrl, objectUrlToBuffer } from '../data';
import HslValues from './HslValues';

export default async function adjustTextureHsl(
  sourceUrl: string,
  hsl: HslValues
) {
  const { h, s, l } = hsl;
  const sourceData = Buffer.from(await objectUrlToBuffer(sourceUrl));
  const imageData = new Uint8ClampedArray(sourceData.length);

  /**
   * colors tend to be within ranges, so create a
   * cache of hashed rgba hsl values (`r,g,b`) to
   * value to prevent re-calculation of hsl.
   *
   **/
  const conversions = new Map<string, { r: number; g: number; b: number }>();

  for (let i = 0; i < sourceData.length; i += 4) {
    const rgbHash = `${sourceData[i]},${sourceData[i + 1]},${
      sourceData[i + 2]
    }`;
    if (!conversions.has(rgbHash)) {
      conversions.set(
        rgbHash,
        adjustHslOfRgba(
          sourceData[i],
          sourceData[i + 1],
          sourceData[i + 2],
          h,
          s,
          l
        )
      );
    }
    const newRgba = conversions.get(rgbHash) as {
      r: number;
      g: number;
      b: number;
    };

    imageData[i] = newRgba.r;
    imageData[i + 1] = newRgba.g;
    imageData[i + 2] = newRgba.b;
    imageData[i + 3] = sourceData[i + 3];
  }

  const dataUrl = await bufferToObjectUrl(imageData);
  return dataUrl;
}
