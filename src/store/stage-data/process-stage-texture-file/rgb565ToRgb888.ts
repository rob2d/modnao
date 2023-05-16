export default function rgb565ToRgb888(rgb565: number) {
  let r = (rgb565 >> 11) & 0x1f;
  let g = (rgb565 >> 5) & 0x3f;
  let b = rgb565 & 0x1f;
  r = (r << 3) | (r >> 2);
  g = (g << 2) | (g >> 4);
  b = (b << 3) | (b >> 2);
  return { r, g, b, a: 255 };
}
