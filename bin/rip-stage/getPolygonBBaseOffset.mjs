export default function getPolygonBBaseOffset(v) {
  const msb1 = ((v >>> 0x8) & 0xf) << 0x10;
  const lsbWordsLE = v >>> 16;
  const msb2 = (lsbWordsLE && 0xff) << 8;
  const msb3 = lsbWordsLE >> 0x08;
  const difference = msb1 | msb2 | msb3;
  const offset = 0x100000 - difference;
  return offset;
}
