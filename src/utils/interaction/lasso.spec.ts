import {
  appendLassoPoint,
  getInteractionBounds,
  isPointInLasso,
  shouldAppendLassoPoint
} from './lasso';

describe('lasso interaction utilities', () => {
  it('gets bounds from interaction points', () => {
    expect(
      getInteractionBounds([
        { x: 6, y: 2 },
        { x: -1, y: 8 },
        { x: 3, y: -4 }
      ])
    ).toEqual({ minX: -1, minY: -4, maxX: 6, maxY: 8 });
  });

  it('only appends lasso points after the minimum distance', () => {
    const points = [{ x: 0, y: 0 }];
    const unchangedPoints = appendLassoPoint(points, { x: 2, y: 1 }, 4);
    const changedPoints = appendLassoPoint(points, { x: 4, y: 0 }, 4);

    expect(shouldAppendLassoPoint(points[0], { x: 2, y: 1 }, 4)).toBe(false);
    expect(shouldAppendLassoPoint(points[0], { x: 4, y: 0 }, 4)).toBe(true);
    expect(unchangedPoints).toBe(points);
    expect(changedPoints).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 }
    ]);
  });

  it('detects points inside a lasso polygon', () => {
    const lassoPoints = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 }
    ];

    expect(isPointInLasso({ x: 5, y: 5 }, lassoPoints)).toBe(true);
    expect(isPointInLasso({ x: 12, y: 5 }, lassoPoints)).toBe(false);
  });

  it('ignores incomplete lasso paths', () => {
    expect(
      isPointInLasso({ x: 1, y: 1 }, [
        { x: 0, y: 0 },
        { x: 2, y: 2 }
      ])
    ).toBe(false);
  });
});
