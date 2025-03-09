import S from '@/constants/StructSizes';
import {
  nlColoredVertexConversions,
  nlMeshConversions,
  nlModelConversions,
  nlPolygonConversions,
  nlVertexConversions
} from './NLPropConversionDefs';
import { processNLConversions } from './processNLConversions';

export type ScanModelParams = {
  address: number;
  ramAddress: number;
  buffer: SharedArrayBuffer;
  index: number;
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

  return model;
}
