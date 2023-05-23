import { RgbaColor } from '../RGBAColor';

export default function rgbaToRgb565(color: RgbaColor) {
  const r = color.r >> 3;
  const g = color.g >> 2;
  const b = color.b >> 3;
  return (r << 11) | (g << 5) | b;
}
