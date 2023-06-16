import HslValues from '../textures/HslValues';

const hueToRgb = (p: number, q: number, t: number) => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};

export default function hslToRgb({ h, s, l }: HslValues) {
  let r, g, b;

  h /= 360;
  s /= 100;
  l /= 100;

  if (s === 0) {
    r = g = b = l; // Achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
    g = Math.round(hueToRgb(p, q, h) * 255);
    b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);
  }

  return { r, g, b };
}
