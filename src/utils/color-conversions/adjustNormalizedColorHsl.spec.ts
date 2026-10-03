import adjustNormalizedColorHsl from './adjustNormalizedColorHsl';

describe('adjustNormalizedColorHsl', () => {
  it('preserves the color and alpha with no adjustment', () => {
    expect(
      adjustNormalizedColorHsl([1, 0, 0, 0.5], { h: 0, s: 0, l: 0 })
    ).toEqual([1, 0, 0, 0.5]);
  });

  it('shifts hue in either direction while preserving alpha', () => {
    expect(
      adjustNormalizedColorHsl([1, 0, 0, 0.5], { h: 120, s: 0, l: 0 })
    ).toEqual([0, 1, 0, 0.5]);
    expect(
      adjustNormalizedColorHsl([1, 0, 0, 0.5], { h: -120, s: 0, l: 0 })
    ).toEqual([0, 0, 1, 0.5]);
  });

  it('desaturates a color to gray', () => {
    expect(
      adjustNormalizedColorHsl([1, 0, 0, 1], { h: 0, s: -100, l: 0 })
    ).toEqual([128 / 255, 128 / 255, 128 / 255, 1]);
  });

  it('limits lightness adjustments to black and white', () => {
    expect(
      adjustNormalizedColorHsl([1, 0, 0, 0.5], { h: 0, s: 0, l: -200 })
    ).toEqual([0, 0, 0, 0.5]);
    expect(
      adjustNormalizedColorHsl([1, 0, 0, 0.5], { h: 0, s: 0, l: 200 })
    ).toEqual([1, 1, 1, 0.5]);
  });
});
