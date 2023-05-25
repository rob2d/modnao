import { RgbaColor } from '../RgbaColor';

export default function rgbaToArgb1555(color: RgbaColor) {
  const r = Math.round((color.r * 31) / 255);
  const g = Math.round((color.g * 31) / 255);
  const b = Math.round((color.b * 31) / 255);
  const a = Math.round(color.a / 255);

  return (a << 15) | (r << 10) | (g << 5) | b;
}
