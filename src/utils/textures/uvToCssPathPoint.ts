export default function uvToCssPathPoint(uv: NLUV, wrapMode = 'clamp') {
  let [u, v] = uv;
  const width = 100;
  const height = 100;

  if (wrapMode === 'repeat') {
    u = u % 1.0;
    v = (1.0 - v) % 1.0;
  } else if (wrapMode === 'mirror') {
    u = Math.abs((u % 2.0) - 1.0);
    v = Math.abs((v % 2.0) - 1.0);
  } else if (wrapMode === 'clamp') {
    u = Math.max(0.0, Math.min(1.0, u));
    v = Math.max(0.0, Math.min(1.0, 1.0 - v));
  }

  const x = (u * width).toFixed(2) + '%';
  const y = (v * height).toFixed(2) + '%';

  return `${x} ${y}`;
}
