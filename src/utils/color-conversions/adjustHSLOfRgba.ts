import { RgbaColor } from '../textures';

function clamp(value: number, min: number, max: number) {
  return Math.max(Math.min(value, max), min);
}

function hueToRGB(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function adjustHSLOfRgba(
  color: RgbaColor,
  hue: number,
  saturation: number,
  lightness: number
) {
  const { r, g, b } = color;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = d / (2 - max - min);
    if (max === r) {
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / d + 2) / 6;
    } else {
      h = ((r - g) / d + 4) / 6;
    }
  }

  h = (h + hue / 360) % 1;
  s = clamp(s + saturation, 0, 1);
  l = clamp(l + lightness, 0, 1);

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const newR = hueToRGB(p, q, h + 1 / 3) * 255;
  const newG = hueToRGB(p, q, h) * 255;
  const newB = hueToRGB(p, q, h - 1 / 3) * 255;

  return [Math.round(newR), Math.round(newG), Math.round(newB)];
}
