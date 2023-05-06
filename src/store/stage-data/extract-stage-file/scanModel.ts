import S from './Sizes';
import getBufferMapper from './getBufferMapper';
import ModelMappings from './ModelMappings';
import toHexString from './toHexString';
import {
  NLMeshConversions,
  NLModelConversions,
  NLPolygonConversions,
  NLVertexConversions
} from './NLPropConversionDefs';
import { parseNLConversions } from './parseNLConversions';

export default function scanModel({
  address,
  buffer,
  index
}: {
  address: number;
  buffer: Buffer;
  index: number;
}) {
  const scan = getBufferMapper(buffer, address, false);

  // (1) scan base model props

  const model = parseNLConversions<NLModel>(
    NLModelConversions,
    buffer,
    address
  );
  model.address = address;
  model.meshes = [];

  // (2) scan through meshes
  try {
    const detectedModelEnd = false;
    let structAddress = address + S.MODEL_HEADER;
    scan.setBaseAddress(structAddress);

    while (structAddress < buffer.length && !detectedModelEnd) {
      const mesh = parseNLConversions<NLMesh>(
        NLMeshConversions,
        buffer,
        structAddress
      );

      mesh.polygons = [];

      const meshEndAddress =
        structAddress +
        ModelMappings.mesh.polygonDataLength[0] +
        mesh.polygonDataLength;

      structAddress += S.MESH;

      // (3) scan polygons within mesh
      while (
        structAddress < meshEndAddress &&
        structAddress + S.VERTEX_B < buffer.length &&
        !detectedModelEnd
      ) {
        scan.setBaseAddress(structAddress);

        const polygon = parseNLConversions<NLPolygon>(
          NLPolygonConversions,
          buffer,
          structAddress
        );
        polygon.vertexes = [];

        structAddress = polygon.address + 8;

        // (4) scan vertexes within polygon

        let detectedMeshEnd = false;
        for (let i = 0; i < polygon.actualVertexCount; i++) {
          if (detectedMeshEnd) {
            console.log('detectedMeshEnd @ structAddress ', structAddress);
            break;
          }

          if (structAddress + S.VERTEX_B >= buffer.length) {
            console.log(
              `invalid logic in parser occurred somewhere near ${structAddress}`
            );
            break;
          }

          const vertex = parseNLConversions<NLVertex>(
            NLVertexConversions,
            buffer,
            structAddress
          );
          vertex.index = i;

          scan.setBaseAddress(structAddress);
          polygon.vertexes.push(vertex);
          structAddress += vertex.contentMode === 'a' ? S.VERTEX_A : S.VERTEX_B;

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
      `${index}: error parsing model @ ` + toHexString(address),
      error
    );
  }

  return model;
}
