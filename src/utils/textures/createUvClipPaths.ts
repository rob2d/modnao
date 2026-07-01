export interface UvClipPathPoint {
  x: number;
  y: number;
}

export type UvClipPath = UvClipPathPoint[];

export interface UvClipPathBounds {
  path: UvClipPath;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const MIN_POLYGON_AREA = 0.000001;
const TILE_EDGE_EPSILON = 0.000001;

const clipPathBoundary = (
  points: UvClipPath,
  isInside: (point: UvClipPathPoint) => boolean,
  intersection: (
    start: UvClipPathPoint,
    end: UvClipPathPoint
  ) => UvClipPathPoint
) => {
  if (points.length === 0) {
    return points;
  }

  const clippedPoints: UvClipPath = [];
  let previousPoint = points[points.length - 1];
  let wasPreviousInside = isInside(previousPoint);

  for (const point of points) {
    const isPointInside = isInside(point);

    if (isPointInside) {
      if (!wasPreviousInside) {
        clippedPoints.push(intersection(previousPoint, point));
      }

      clippedPoints.push(point);
    } else if (wasPreviousInside) {
      clippedPoints.push(intersection(previousPoint, point));
    }

    previousPoint = point;
    wasPreviousInside = isPointInside;
  }

  return clippedPoints;
};

const getTileIndexes = (min: number, max: number, size: number) => {
  const start = Math.floor(min / size);
  const end = Math.floor((max - TILE_EDGE_EPSILON) / size);
  const indexes: number[] = [];

  for (let index = start; index <= end; index++) {
    indexes.push(index);
  }

  return indexes;
};

export const getUvClipPathBounds = (path: UvClipPath): UvClipPathBounds => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  path.forEach(({ x, y }) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });

  return {
    path,
    minX,
    maxX,
    minY,
    maxY
  };
};

const isPointInUvClipPathBounds = (
  x: number,
  y: number,
  { path, minX, maxX, minY, maxY }: UvClipPathBounds
) => {
  if (path.length < 3 || x < minX || x > maxX || y < minY || y > maxY) {
    return false;
  }

  let isInside = false;

  for (
    let pointIndex = 0, previousPointIndex = path.length - 1;
    pointIndex < path.length;
    previousPointIndex = pointIndex, pointIndex += 1
  ) {
    const currentPoint = path[pointIndex];
    const previousPoint = path[previousPointIndex];
    const crossesHorizontalRay =
      currentPoint.y > y !== previousPoint.y > y &&
      x <
        ((previousPoint.x - currentPoint.x) * (y - currentPoint.y)) /
          (previousPoint.y - currentPoint.y) +
          currentPoint.x;

    if (crossesHorizontalRay) {
      isInside = !isInside;
    }
  }

  return isInside;
};

export const getUvClipPathPixelByteIndexes = (
  uvClipPathBounds: UvClipPathBounds[],
  width: number,
  height: number
) => {
  const byteIndexes: number[] = [];

  uvClipPathBounds.forEach((bounds) => {
    const startX = Math.max(0, Math.floor(bounds.minX));
    const endX = Math.min(width, Math.ceil(bounds.maxX));
    const startY = Math.max(0, Math.floor(bounds.minY));
    const endY = Math.min(height, Math.ceil(bounds.maxY));

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (isPointInUvClipPathBounds(x + 0.5, y + 0.5, bounds)) {
          byteIndexes.push((y * width + x) * 4);
        }
      }
    }
  });

  return byteIndexes;
};

export default function createUvClipPaths(
  uvs: NLUV[],
  width: number,
  height: number,
  flags: TextureWrappingFlags
) {
  const unwrappedPath = uvs.map(([u, v]) => {
    const x = flags.hFlip ? 1 - u : u;
    const y = flags.vFlip ? v : 1 - v;

    return {
      x: x * width,
      y: y * height
    };
  });
  const xs = unwrappedPath.map((point) => point.x);
  const ys = unwrappedPath.map((point) => point.y);
  const hTileIndexes = flags.hRepeat
    ? getTileIndexes(Math.min(...xs), Math.max(...xs), width)
    : [0];
  const vTileIndexes = flags.vRepeat
    ? getTileIndexes(Math.min(...ys), Math.max(...ys), height)
    : [0];
  const paths: UvClipPath[] = [];

  for (const hTileIndex of hTileIndexes) {
    for (const vTileIndex of vTileIndexes) {
      let clippedPath = unwrappedPath;

      if (flags.hRepeat) {
        const left = hTileIndex * width;
        const right = (hTileIndex + 1) * width;

        clippedPath = clipPathBoundary(
          clippedPath,
          (point) => point.x >= left,
          (start, end) => {
            const progress = (left - start.x) / (end.x - start.x);

            return {
              x: left,
              y: start.y + (end.y - start.y) * progress
            };
          }
        );
        clippedPath = clipPathBoundary(
          clippedPath,
          (point) => point.x <= right,
          (start, end) => {
            const progress = (right - start.x) / (end.x - start.x);

            return {
              x: right,
              y: start.y + (end.y - start.y) * progress
            };
          }
        );
      }

      if (flags.vRepeat) {
        const top = vTileIndex * height;
        const bottom = (vTileIndex + 1) * height;

        clippedPath = clipPathBoundary(
          clippedPath,
          (point) => point.y >= top,
          (start, end) => {
            const progress = (top - start.y) / (end.y - start.y);

            return {
              x: start.x + (end.x - start.x) * progress,
              y: top
            };
          }
        );
        clippedPath = clipPathBoundary(
          clippedPath,
          (point) => point.y <= bottom,
          (start, end) => {
            const progress = (bottom - start.y) / (end.y - start.y);

            return {
              x: start.x + (end.x - start.x) * progress,
              y: bottom
            };
          }
        );
      }

      let clippedPathArea = 0;

      for (let i = 0; i < clippedPath.length; i++) {
        const nextIndex = (i + 1) % clippedPath.length;
        clippedPathArea += clippedPath[i].x * clippedPath[nextIndex].y;
        clippedPathArea -= clippedPath[nextIndex].x * clippedPath[i].y;
      }

      if (Math.abs(clippedPathArea / 2) <= MIN_POLYGON_AREA) {
        continue;
      }

      paths.push(
        clippedPath.map((point) => ({
          x: flags.hRepeat ? point.x - hTileIndex * width : point.x,
          y: flags.vRepeat ? point.y - vTileIndex * height : point.y
        }))
      );
    }
  }

  return paths;
}
