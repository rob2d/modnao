export default function decodeZMortonPosition(z: number) {
  let x = 0;
  let y = 0;
  for (let i = 0; i < 32; i++) {
    x |= (z & (1 << (2 * i))) >> i;
    y |= (z & (1 << (2 * i + 1))) >> (i + 1);
  }
  return [x, y];
}
