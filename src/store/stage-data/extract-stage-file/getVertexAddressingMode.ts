/**
 * Returns whether the value for a vertex type
 * provided is of type B or A
 *
 * @param {number} value 32-bit value
 */
export default function getVertexAddressingMode(value: number) {
  const structValue = (value & 0xffff0000) >> 0x10;
  const isReference = structValue >= 0x5ff0 && structValue <= 0x5fff;

  return isReference ? 'reference' : 'direct';
}
