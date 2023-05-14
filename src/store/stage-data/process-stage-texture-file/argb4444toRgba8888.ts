export default function argb4444ToRgba8888(argb4444: number) {
  const a = ((argb4444 >> 12) & 0xf) * 0x11;
  const r = ((argb4444 >> 8) & 0xf) * 0x11;
  const g = ((argb4444 >> 4) & 0xf) * 0x11;
  const b = (argb4444 & 0xf) * 0x11;
  return { a, r, g, b };
}
