import adjustHslOfRgba from '../color-conversions/adjustHslOfRgba';
import offscreenCanvasToDataUrl from '../offscreenCanvasToDataUrl';
import HslValues from './HslValues';

export default async function adjustTextureHsl(
  sourceImageData: ImageData,
  hsl: HslValues
) {
  const { h, s, l } = hsl;
  const canvas = new OffscreenCanvas(
    sourceImageData.width,
    sourceImageData.height
  );
  const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const sourceData = sourceImageData.data;

  /**
   * colors tend to be within ranges, so create a
   * cache of hashed rgba hsl values (`r,g,b`) to
   * value to prevent re-calculation of hsl.
   *
   **/
  const conversions = new Map<string, { r: number; g: number; b: number }>();

  for (let i = 0; i < sourceData.length; i += 4) {
    const data = imageData.data;
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
    data[i] = newRgba.r;
    data[i + 1] = newRgba.g;
    data[i + 2] = newRgba.b;
    data[i + 3] = sourceData[i + 3];
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((-90 * Math.PI) / 180);

  const createdData = await createImageBitmap(imageData);
  ctx.drawImage(createdData, -canvas.width / 2, -canvas.height / 2);

  const dataUrl = await offscreenCanvasToDataUrl(canvas);
  return dataUrl;
}
