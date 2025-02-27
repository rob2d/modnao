import getTextureSize from './getTextureSize';

describe('getTextureSize', () => {
  it("reliably provides a textures width and height when provided a value for a model's texture", () => {
    expect(getTextureSize(0x00)).toEqual([8, 8]);
    expect(getTextureSize(0x01)).toEqual([8, 16]);
    expect(getTextureSize(0x02)).toEqual([8, 32]);
    expect(getTextureSize(0x07)).toEqual([8, 1024]);
    expect(getTextureSize(0xeb)).toEqual([256, 64]);
    expect(getTextureSize(0xfe)).toEqual([1024, 512]);
    expect(getTextureSize(0xff)).toEqual([1024, 1024]);
  });
});
