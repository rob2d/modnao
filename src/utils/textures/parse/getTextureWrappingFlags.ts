const hFlipValues = new Set([0x04, 0x06, 0x0c, 0x0e]);
const vFlipValues = new Set([0x02, 0x03, 0x06, 0x07, 0x0a, 0x0b]);
const hRepeatValues = new Set([0x00, 0x02, 0x08, 0x0a]);
const vRepeatValues = new Set([0x00, 0x01, 0x04, 0x05, 0x08, 0x09, 0x0c, 0x0d]);
const hStretchValues = new Set([
  0x01, 0x03, 0x05, 0x07, 0x09, 0x0b, 0x0d, 0x0f
]);

const getTextureWrappingFlags = (v: number): TextureWrappingFlags => ({
  hFlip: hFlipValues.has(v),
  vFlip: vFlipValues.has(v),
  hRepeat: hRepeatValues.has(v),
  vRepeat: vRepeatValues.has(v),
  hStretch: hStretchValues.has(v)
});

export default getTextureWrappingFlags;
