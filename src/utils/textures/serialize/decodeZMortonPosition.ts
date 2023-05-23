export default function encodeZMortonPosition(code: number) {
  let x = 0;
  let y = 0;
  for (let i = 0; i < 32; i++) {
    x |= (code & (1 << i)) >> i;
    y |= (code & (1 << (i + 1))) >> (i + 1);
    i++;
  }
  return [x, y];
}
