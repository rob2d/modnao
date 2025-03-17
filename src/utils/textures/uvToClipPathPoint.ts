export default function uvToClipPathPoint(
  uv: NLUV,
  width: number,
  height: number,
  flags: TextureWrappingFlags
) {
  let [u, v] = uv;

  // Flip Y-axis before handling repeating logic
  v = 1.0 - v;

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
