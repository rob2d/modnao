import uvToClipPathPoint from './uvToClipPathPoint';

const defaultWrappingFlags: TextureWrappingFlags = {
  hFlip: false,
  vFlip: false,
  hRepeat: false,
  vRepeat: false,
  hStretch: false
};

describe('uvToClipPathPoint', () => {
  it('keeps repeated UV coordinates inside the texture bounds', () => {
    expect(
      uvToClipPathPoint([3.797257423400879, -0.30448248982429504], 128, 128, {
        ...defaultWrappingFlags,
        hRepeat: true,
        vRepeat: true
      })
    ).toEqual({
      x: 102.0489501953125,
      y: 38.973758697509766
    });
  });

  it('preserves edge UV coordinates when repeat is enabled', () => {
    expect(
      uvToClipPathPoint([0.494140625, 0], 512, 512, {
        ...defaultWrappingFlags,
        vRepeat: true
      })
    ).toEqual({
      x: 253,
      y: 512
    });
  });

  it('preserves out-of-bounds UV coordinates when repeat is disabled', () => {
    expect(
      uvToClipPathPoint(
        [3.797257423400879, -0.30448248982429504],
        128,
        128,
        defaultWrappingFlags
      )
    ).toEqual({
      x: 486.0489501953125,
      y: 166.97375869750977
    });
  });
});
