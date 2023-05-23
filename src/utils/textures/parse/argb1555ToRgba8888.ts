export default function argb1555ToRgba8888(argb1555: number) {
  const a = ((argb1555 >> 15) & 0x01) * 255; // Extract alpha component (1-bit)
  const r = ((argb1555 >> 10) & 0x1f) * 8; // Extract red component (5-bits) and expand to 8-bits
  const g = ((argb1555 >> 5) & 0x1f) * 8; // Extract green component (5-bits) and expand to 8-bits
  const b = (argb1555 & 0x1f) * 8; // Extract blue component (5-bits) and expand to 8-bits

  return { r, g, b, a };
}
