/**
 * Returns whether the value for a vertex type
 * provided is of type B or A
 *
 * @param {number} value 32-bit value
 */
export default function detectPolygonType(value: number) {
  const structValue = (value & 0xffff0000) >> 0x10;
  const isTypeB = structValue >= 0x5ffb && structValue <= 0x5fff;

  return isTypeB ? 'b' : 'a';
}
