import { adjustHslOfRgba } from '../color-conversions/adjustHslOfRgba';
import loadImageFromDataUrl from '../images/loadImageFromDataUrl';

export default async function adjustTextureHsl(
  dataUrl: string,
  h: number,
  s: number,
  l: number
) {
  const image = await loadImageFromDataUrl(dataUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  canvas.width = image.width;
  canvas.height = image.height;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const color = {
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
      a: data[i + 3]
    };
    const [hslR, hslG, hslB, hslA] = adjustHslOfRgba(color, h, s, l);
    data[i] = hslR;
    data[i + 1] = hslG;
    data[i + 2] = hslB;
    data[i + 3] = hslA;
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL();
}
