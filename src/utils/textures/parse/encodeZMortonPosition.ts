export default function encodeZMortonPosition(x: number, y: number) {
  x &= 0x0000ffff; // Mask with 16 one bits
  y &= 0x0000ffff; // Mask with 16 one bits
  x = (x | (x << 8)) & 0x00ff00ff; // Interleave bits of x
  y = (y | (y << 8)) & 0x00ff00ff; // Interleave bits of y
  x = (x | (x << 4)) & 0x0f0f0f0f; // Interleave bits of x again
  y = (y | (y << 4)) & 0x0f0f0f0f; // Interleave bits of y again
  x = (x | (x << 2)) & 0x33333333; // Interleave bits of x yet again
  y = (y | (y << 2)) & 0x33333333; // Interleave bits of y yet again
  x = (x | (x << 1)) & 0x55555555; // Interleave bits of x for the last time
  y = (y | (y << 1)) & 0x55555555; // Interleave bits of y for the last time
  return x | (y << 1); // Combine interleaved x and y bits
}
