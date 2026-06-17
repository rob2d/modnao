export default function uvToClipPathPoint(
  [u, v]: NLUV,
  width: number,
  height: number,
  flags: TextureWrappingFlags
) {
  // Flip Y-axis before handling repeating logic
  v = 1.0 - v;

  if (flags.hRepeat && (u < 0 || u > 1)) {
    u -= Math.floor(u);
  }
  if (flags.vRepeat && (v < 0 || v > 1)) {
    v -= Math.floor(v);
  }

  // Flip after applying the repeat/clamp logic
  if (flags.hFlip) {
    u = 1.0 - u;
  }
  if (flags.vFlip) {
    v = 1.0 - v;
  }

  // Convert UVs to pixel coordinates
  return {
    x: u * width,
    y: v * height
  };
}
