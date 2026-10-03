import argb1555ToRgba8888 from './argb1555ToRgba8888';
import rgbaToArgb1555 from './rgbaToArgb1555';

describe('argb1555ToRgba8888', () => {
  it('expands white to the full channel range', () => {
    expect(argb1555ToRgba8888(0xffff)).toEqual({
      r: 255,
      g: 255,
      b: 255,
      a: 255
    });
  });

  it('preserves every ARGB1555 word through RGBA conversion', () => {
    const mismatches: number[] = [];

    for (let word = 0; word <= 0xffff; word++) {
      if (rgbaToArgb1555(argb1555ToRgba8888(word)) !== word) {
        mismatches.push(word);
      }
    }

    expect(mismatches).toHaveLength(0);
  });
});
