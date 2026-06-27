export interface InteractionPoint {
  x: number;
  y: number;
}

export interface InteractionBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const DEFAULT_LASSO_POINT_DISTANCE = 4;

export function getInteractionBounds(
  points: InteractionPoint[]
): InteractionBounds | undefined {
  if (!points.length) {
    return undefined;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  points.forEach(({ x, y }) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  return { minX, minY, maxX, maxY };
}

export function isPointWithinInteractionBounds(
  point: InteractionPoint,
  bounds: InteractionBounds
) {
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY
  );
}

export function shouldAppendLassoPoint(
  lastPoint: InteractionPoint | undefined,
  nextPoint: InteractionPoint,
  minDistance = DEFAULT_LASSO_POINT_DISTANCE
) {
  if (!lastPoint) {
    return true;
  }

  const deltaX = nextPoint.x - lastPoint.x;
  const deltaY = nextPoint.y - lastPoint.y;

  return deltaX * deltaX + deltaY * deltaY >= minDistance * minDistance;
}

export function appendLassoPoint(
  points: InteractionPoint[],
  nextPoint: InteractionPoint,
  minDistance = DEFAULT_LASSO_POINT_DISTANCE
) {
  const lastPoint = points[points.length - 1];

  if (!shouldAppendLassoPoint(lastPoint, nextPoint, minDistance)) {
    return points;
  }

  return [...points, nextPoint];
}

export function isPointInLasso(
  point: InteractionPoint,
  lassoPoints: InteractionPoint[],
  lassoBounds = getInteractionBounds(lassoPoints)
) {
  if (lassoPoints.length < 3) {
    return false;
  }

  if (!lassoBounds || !isPointWithinInteractionBounds(point, lassoBounds)) {
    return false;
  }

  let isInside = false;

  for (
    let pointIndex = 0, previousPointIndex = lassoPoints.length - 1;
    pointIndex < lassoPoints.length;
    previousPointIndex = pointIndex, pointIndex += 1
  ) {
    const currentPoint = lassoPoints[pointIndex];
    const previousPoint = lassoPoints[previousPointIndex];
    const crossesHorizontalRay =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          (previousPoint.y - currentPoint.y) +
          currentPoint.x;

    if (crossesHorizontalRay) {
      isInside = !isInside;
    }
  }

  return isInside;
}
