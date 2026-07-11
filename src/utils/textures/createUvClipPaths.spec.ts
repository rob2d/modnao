import createUvClipPaths, {
  getUvClipPathBounds,
  getUvClipPathPixelByteIndexes
} from './createUvClipPaths';

const defaultWrappingFlags: TextureWrappingFlags = {
  hFlip: false,
  vFlip: false,
  hRepeat: false,
  vRepeat: false,
  hStretch: false
};

describe('createUvClipPaths', () => {
  it('keeps in-bounds UV triangles as a single path', () => {
    expect(
      createUvClipPaths(
        [
          [0.1220703125, 0.2939453423023224],
          [0.1279296875, 0.3291015923023224],
          [0.0048828125, 0.3056640923023224]
        ],
        512,
        512,
        defaultWrappingFlags
      )
    ).toEqual([
      [
        { x: 62.5, y: 361.49998474121094 },
        { x: 65.5, y: 343.49998474121094 },
        { x: 2.5, y: 355.49998474121094 }
      ]
    ]);
  });

  it('preserves edge UV coordinates when repeat is enabled', () => {
    expect(
      createUvClipPaths(
        [
          [0.494140625, 0],
          [0.5, 0.03125],
          [0.48828125, 0.03125]
        ],
        512,
        512,
        {
          ...defaultWrappingFlags,
          vRepeat: true
        }
      )
    ).toEqual([
      [
        { x: 253, y: 512 },
        { x: 256, y: 496 },
        { x: 250, y: 496 }
      ]
    ]);
  });

  it('preserves out-of-bounds UV coordinates when repeat is disabled', () => {
    const paths = createUvClipPaths(
      [
        [3.797257423400879, -0.30448248982429504],
        [3.897257423400879, -0.30448248982429504],
        [3.797257423400879, -0.20448248982429504]
      ],
      128,
      128,
      defaultWrappingFlags
    );

    expect(paths).toHaveLength(1);
    expect(paths[0][0].x).toBeCloseTo(486.0489501953125);
    expect(paths[0][0].y).toBeCloseTo(166.97375869750977);
    expect(paths[0][1].x).toBeCloseTo(498.8489501953125);
    expect(paths[0][1].y).toBeCloseTo(166.97375869750977);
    expect(paths[0][2].x).toBeCloseTo(486.0489501953125);
    expect(paths[0][2].y).toBeCloseTo(154.17375869750978);
  });

  it('splits repeated UV triangles at the texture boundary', () => {
    const paths = createUvClipPaths(
      [
        [0.0029296875, -0.1025390699505806],
        [0.2060546875, 0.2060547024011612],
        [0.1220703125, 0.2939453423023224]
      ],
      512,
      512,
      {
        ...defaultWrappingFlags,
        vRepeat: true
      }
    );

    expect(paths).toHaveLength(2);
    expect(
      paths.every((path) =>
        path.every((point) => point.y >= 0 && point.y <= 512)
      )
    ).toBe(true);
    expect(
      paths.every((path) => {
        const ys = path.map((point) => point.y);

        return Math.max(...ys) - Math.min(...ys) < 160;
      })
    ).toBe(true);
  });

  it('includes pixels along shared UV polygon edges', () => {
    expect(
      getUvClipPathPixelByteIndexes(
        [
          getUvClipPathBounds([
            { x: 0, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 2 }
          ]),
          getUvClipPathBounds([
            { x: 2, y: 0 },
            { x: 2, y: 2 },
            { x: 0, y: 2 }
          ])
        ],
        2,
        2
      )
    ).toEqual([0, 4, 8, 12]);
  });
});
