export default function uvToClipPathPoint(
  [u, v]: NLUV,
  width: number,
  height: number,
  flags: TextureWrappingFlags
) {
  // flip Y-axis before handling repeating logic
  v = 1.0 - v;

  const hRepeatOverflow = u < 0 ? -u : u > 1 ? u - 1 : 0;
  const vRepeatOverflow = v < 0 ? -v : v > 1 ? v - 1 : 0;

  if (flags.hRepeat && hRepeatOverflow > 1 / width) {
    u -= Math.floor(u);
  }
  if (flags.vRepeat && vRepeatOverflow > 1 / height) {
    v -= Math.floor(v);
  }

  // flip after applying the repeat/clamp logic
  if (flags.hFlip) {
    u = 1.0 - u;
  }
  if (flags.vFlip) {
    v = 1.0 - v;
  }

  // convert UVs to pixel coordinates
  return {
    x: u * width,
    y: v * height
  };
}
