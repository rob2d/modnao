import adjustHslOfRgba from '../color-conversions/adjustHslOfRgba';
import HslValues from './HslValues';

export default async function adjustTextureHsl(
  sourceImageData: ImageData,
  hsl: HslValues
) {
  const { h, s, l } = hsl;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  canvas.width = sourceImageData.width;
  canvas.height = sourceImageData.height;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const sourceData = sourceImageData.data;

  for (let i = 0; i < sourceData.length; i += 4) {
    const color = {
      r: sourceData[i],
      g: sourceData[i + 1],
      b: sourceData[i + 2],
      a: sourceData[i + 3]
    };

    const data = imageData.data;
    const newRgba = adjustHslOfRgba(color, h, s, l);
    data[i] = newRgba.r;
    data[i + 1] = newRgba.g;
    data[i + 2] = newRgba.b;
    data[i + 3] = newRgba.a;
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL();
}
