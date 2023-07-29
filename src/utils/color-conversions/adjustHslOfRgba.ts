import hslToRgb from './hslToRgb';
import rgbToHsl from './rgbToHsl';

function clamp(value: number, min: number, max: number) {
  return Math.max(Math.min(value, max), min);
}

export default function adjustHslOfRgba(
  r: number,
  g: number,
  b: number,
  h: number,
  s: number,
  l: number
) {
  const hsl = rgbToHsl(r, g, b);
  const color = {
    ...hslToRgb(
      (h + hsl.h) % 360,
      clamp(hsl.s + s, 0, 100),
      clamp(hsl.l + l, -100, 100)
    )
  };
  return color;
}
