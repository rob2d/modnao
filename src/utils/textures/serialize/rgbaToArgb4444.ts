import { RgbaColor } from '../RGBAColor';

export default function rgbaToArgb444(color: RgbaColor) {
  const r = Math.round((color.r * 15) / 255);
  const g = Math.round((color.g * 15) / 255);
  const b = Math.round((color.b * 15) / 255);
  const a = Math.round((color.a * 15) / 255);

  return (a << 12) | (r << 8) | (g << 4) | b;
}
