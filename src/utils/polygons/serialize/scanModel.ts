import S from '@/constants/StructSizes';
import {
  nlColoredVertexConversions,
  nlMeshConversions,
  nlModelConversions,
  nlPolygonConversions,
  nlVertexConversions
} from './NLPropConversionDefs';
import { processNLConversions } from './processNLConversions';

const MAIN_BOUNDS_STANDARD_DEVIATION_LIMIT = 3;

export type ScanModelParams = {
  address: number;
  ramAddress: number;
  buffer: SharedArrayBuffer;
  index: number;
};

const getMedian = (values: number[]) => {
  const sortedValues = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sortedValues.length / 2);

  return sortedValues.length % 2 === 0
    ? (sortedValues[midpoint - 1] + sortedValues[midpoint]) / 2
    : sortedValues[midpoint];
};

const getMedianPoint = (points: Point3D[]): Point3D => [
  getMedian(points.map(([x]) => x)),
  getMedian(points.map(([, y]) => y)),
  getMedian(points.map(([, , z]) => z))
];

const getDistance = ([x, y, z]: Point3D, center: Point3D) =>
  Math.sqrt(
    Math.pow(x - center[0], 2) +
      Math.pow(y - center[1], 2) +
      Math.pow(z - center[2], 2)
  );

const getBounds = (
  points: Point3D[],
  totalVertexCount: number
): ModelBounds => {
  if (points.length === 0) {
    return {
      min: [0, 0, 0],
      max: [0, 0, 0],
      center: [0, 0, 0],
      size: [0, 0, 0],
      vertexCount: 0,
      totalVertexCount
    };
  }

  const min: Point3D = [Infinity, Infinity, Infinity];
  const max: Point3D = [-Infinity, -Infinity, -Infinity];

  points.forEach((point) => {
    point.forEach((value, axis) => {
      min[axis] = Math.min(min[axis], value);
      max[axis] = Math.max(max[axis], value);
    });
  });

  return {
    min,
    max,
    center: [
      (min[0] + max[0]) / 2,
      (min[1] + max[1]) / 2,
      (min[2] + max[2]) / 2
    ],
    size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
    vertexCount: points.length,
    totalVertexCount
  };
};

const getMainBounds = (model: NLModel): ModelBounds => {
  const vertexPositions = model.meshes.flatMap((mesh) =>
    mesh.polygons.flatMap((polygon) =>
      polygon.vertices.map((vertex) => vertex.position)
    )
  );

  if (vertexPositions.length === 0) {
    return getBounds(vertexPositions, model.totalVertexCount);
  }

  const medianPoint = getMedianPoint(vertexPositions);
  const distances = vertexPositions.map((point) =>
    getDistance(point, medianPoint)
  );
  const meanDistance =
    distances.reduce((sum, distance) => sum + distance, 0) / distances.length;
  const standardDeviation = Math.sqrt(
    distances.reduce(
      (sum, distance) => sum + Math.pow(distance - meanDistance, 2),
      0
    ) / distances.length
  );
  const distanceLimit =
    meanDistance + standardDeviation * MAIN_BOUNDS_STANDARD_DEVIATION_LIMIT;
  const mainVertexPositions = vertexPositions.filter(
    (point) => getDistance(point, medianPoint) <= distanceLimit
  );

  return getBounds(
    mainVertexPositions.length === 0 ? vertexPositions : mainVertexPositions,
    vertexPositions.length
  );
};

export default function scanModel({
  address,
  ramAddress,
  buffer,
  index
}: ScanModelParams) {
  const wBuffer = Buffer.from(new Uint8Array(buffer));
  // (1) scan base model props
  const model = processNLConversions<NLModel>(
    nlModelConversions,
    wBuffer,
    address
  );

  model.address = address;
  model.ramAddress = ramAddress;
  model.meshes = [];

  // total vert count is populated
  // at the end of parsing polygons
  // following a ds flag

  model.totalVertexCount = 0;

  // (2) scan through meshes
  try {
    let detectedModelEnd = false;
    let structAddress = address + S.MODEL_HEADER;

    while (structAddress < wBuffer.length && !detectedModelEnd) {
      if (wBuffer.readUInt32LE(structAddress) === 0) {
        detectedModelEnd = true;
        structAddress += 4;
        model.totalVertexCount = wBuffer.readUInt32LE(structAddress);
        structAddress += 4;
        break;
      }

      const mesh = processNLConversions<NLMesh>(
        nlMeshConversions,
        wBuffer,
        structAddress
      );

      mesh.polygons = [];

      structAddress += S.MESH;
      const meshEndAddress = structAddress + mesh.polygonDataLength;

      // (3) scan polygons within mesh
      while (
        structAddress < meshEndAddress &&
        structAddress + S.VERTEX_B < wBuffer.length &&
        !detectedModelEnd
      ) {
        const polygon = processNLConversions<NLPolygon>(
          nlPolygonConversions,
          wBuffer,
          structAddress
        );
        polygon.vertices = [];

        structAddress = polygon.address + S.POLYGON_HEADER;

        // (4) scan vertices within polygon
        let detectedMeshEnd = false;
        for (let i = 0; i < polygon.actualVertexCount; i++) {
          // detect modelEnd flag in the vertex position
          if (wBuffer.readUInt32LE(structAddress) === 0) {
            detectedModelEnd = true;
            detectedMeshEnd = true;
            structAddress += 4;
            model.totalVertexCount = wBuffer.readUInt32LE(structAddress);
            structAddress += 4;
            break;
          }

          if (detectedMeshEnd) {
            break;
          }

          if (structAddress + S.VERTEX_B >= wBuffer.length) {
            console.log(
              `invalid logic in parser occurred somewhere near ${structAddress}; went beyond buffer length of ${wBuffer.length}`
            );
            break;
          }

          const vertex = processNLConversions<NLVertex>(
            mesh.hasColoredVertices
              ? nlColoredVertexConversions
              : nlVertexConversions,
            wBuffer,
            structAddress
          );

          vertex.index = i;
          polygon.vertices.push(vertex);
          structAddress +=
            vertex.addressingMode === 'direct' ? S.VERTEX_A : S.VERTEX_B;

          if (structAddress >= meshEndAddress) {
            detectedMeshEnd = true;
          }
        }

        // populate polygon indices
        // note: there are some quirks that aren't fully sorted
        // here with winding order. Good case scenario to debug
        // is bird model on STG01 in MVC2
        let stripCount = 0;
        const indices: number[] = [];
        polygon.vertices.forEach((v, i) => {
          if (polygon.vertexGroupMode === 'regular') {
            if (i > polygon.vertices.length - 3) {
              return;
            }

            if (stripCount % 2 === 0) {
              if (polygon.flags.cullingType === 'front') {
                indices.push(i + 1, i, i + 2);
              } else {
                indices.push(i, i + 1, i + 2);
              }
            } else {
              if (polygon.flags.cullingType === 'front') {
                indices.push(i, i + 1, i + 2);
              } else {
                indices.push(i + 1, i, i + 2);
              }
            }
          }

          stripCount += 1;
        });

        if (polygon.vertexGroupMode === 'triple') {
          for (let i = 2; i < polygon.vertices.length; i += 3) {
            if (polygon.flags.cullingType === 'front') {
              indices.push(i - 1, i - 2, i);
            } else {
              indices.push(i - 2, i - 1, i);
            }
          }
          stripCount += 1;
        }

        // pre-calculate order of triangle indices
        // for wireframe drawing & uv atlas polygon highlights
        const triIndices: number[] = [];

        for (let i = 0; i < indices.length; i += 3) {
          triIndices.push(
            indices[i],
            indices[i + 1],
            indices[i + 2],
            indices[i]
          );
        }

        polygon.indices = indices;
        polygon.triIndices = triIndices;
        mesh.polygons.push(polygon);
      }

      model.meshes.push(mesh);
    }
  } catch (error) {
    // @TODO: more thoughtful handling of errors
    console.trace(
      `${index}: error parsing model @ 0x${address.toString(16)}`,
      error
    );
  }

  model.mainBounds = getMainBounds(model);

  return model;
}
