import { RgbaColor } from '../textures';
import hslToRgb from './hslToRgb';
import rgbToHsl from './rgbToHsl';

function clamp(value: number, min: number, max: number) {
  return Math.max(Math.min(value, max), min);
}

export default function adjustHslOfRgba(
  rgba: RgbaColor,
  h: number,
  s: number,
  l: number
) {
  const hsl = rgbToHsl(rgba.r, rgba.g, rgba.b);
  const color: RgbaColor = {
    ...hslToRgb({
      h: (h + hsl.h) % 360,
      s: clamp(hsl.s + s, 0, 100),
      l: clamp(hsl.l + l, -100, 100)
    }),
    a: rgba.a
  };
  return color;
}
