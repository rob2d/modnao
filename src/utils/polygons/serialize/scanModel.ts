import S from '@/constants/StructSizes';
import {
  nlColoredVertexConversions,
  nlMeshConversions,
  nlModelConversions,
  nlPolygonConversions,
  nlVertexConversions
} from './NLPropConversionDefs';
import { processNLConversions as processNLConversions } from './processNLConversions';
import TransferrableBuffer from '@/types/TransferrableBuffer';

export default function scanModel({
  address,
  buffer,
  index
}: {
  address: number;
  buffer: TransferrableBuffer;
  index: number;
}) {
  const wBuffer = Buffer.from(buffer);
  // (1) scan base model props
  const model = processNLConversions<NLModel>(
    nlModelConversions,
    wBuffer,
    address
  );

  model.address = address;
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
