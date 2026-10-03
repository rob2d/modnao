import hexToNormalizedColor from './hexToNormalizedColor';

describe('hexToNormalizedColor', () => {
  it('converts six-digit RGB colors with or without a hash', () => {
    expect(hexToNormalizedColor('#FF8000')).toEqual([1, 128 / 255, 0]);
    expect(hexToNormalizedColor('ff8000')).toEqual([1, 128 / 255, 0]);
  });

  it('returns undefined for unsupported or invalid hex colors', () => {
    for (const color of ['', '#fff', '#gg8000', '#ff800000']) {
      expect(hexToNormalizedColor(color)).toBeUndefined();
    }
  });
});
