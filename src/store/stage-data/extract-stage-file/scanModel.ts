import S from './Sizes';
import getBufferMapper from './getBufferMapper';
import ModelMappings from './ModelMappings';
import getTextureWrappingFlags from './getTextureWrappingFlags';
import getPolygonType from './getPolygonType';
import toHexString from './toHexString';

const meshMappings = ModelMappings.mesh;
const polyMappings = meshMappings.polygon;
const vertexMappings = polyMappings.vertex;

// @TODO: clean up logic here; a bit slopped
// together since importing and converting
// old script to TS in order to start testing

export default function scanModel({
  address,
  buffer,
  index
}: {
  address: number;
  buffer: Buffer;
  index: number;
}) {
  const h = (offset: number) => address - offset;
  const scan = getBufferMapper(buffer, address, false);

  const model: NLStageModel = {
    address,
    position: scan(ModelMappings.position),
    radius: scan(ModelMappings.radius),
    meshes: []
  };

  try {
    scan.setBaseAddress(address + S.MODEL_HEADER);

    const detectedModelEnd = false;
    let structAddress = address + S.MODEL_HEADER;

    while (structAddress < buffer.length && !detectedModelEnd) {
      const textureWrappingValue = scan(ModelMappings.mesh.textureWrapping);
      const mesh: NLMesh = {
        textureWrappingValue,
        textureControlValue: scan(ModelMappings.mesh.textureControlValue),
        textureColorFormat: scan(ModelMappings.mesh.textureColorFormat),
        textureNumber: scan(ModelMappings.mesh.textureNumber),
        specularLightValue: scan(ModelMappings.mesh.specularLightValue),
        position: scan(ModelMappings.mesh.position),
        alpha: scan(ModelMappings.mesh.alpha),
        color: scan(ModelMappings.mesh.color),
        polygonDataLength: scan(ModelMappings.mesh.polygonDataLength),
        polygons: [],
        textureWrappingFlags: getTextureWrappingFlags(textureWrappingValue)
      };

      const meshEndAddress =
        structAddress +
        ModelMappings.mesh.polygonDataLength[0] +
        mesh.polygonDataLength;

      structAddress += S.MESH;

      // scan polygons within mesh
      while (
        structAddress < meshEndAddress &&
        structAddress + S.VERTEX_B < buffer.length &&
        !detectedModelEnd
      ) {
        scan.setBaseAddress(structAddress);

        const polygon: NLPolygon = {
          address: structAddress,
          vertexCount: scan(polyMappings.vertexCount),
          vertexGroupModeValue: scan(polyMappings.vertexGroupMode),
          vertexGroupMode: 'regular',
          vertexes: []
        };

        // @TODO: verify this logic
        const binVertexGroup = [
          ...`${polygon.vertexGroupModeValue.toString(2)}`
        ]
          .reverse()
          .join()
          .padStart(8, '0');

        if (
          binVertexGroup[1] === '1' ||
          polygon.vertexGroupModeValue === 0x0a
        ) {
          polygon.vertexGroupMode = 'triple';
        }

        const vertexCount =
          polygon.vertexCount * (polygon.vertexGroupMode == 'triple' ? 3 : 1);
        structAddress = polygon.address + 8;

        // ------------- //
        // scan vertexes //
        // ------------- //

        let detectedMeshEnd = false;

        for (let i = 0; i < vertexCount; i++) {
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

          const vertexContentModeValue = scan(
            vertexMappings.nanContentModeFlag
          );

          const vertexOffset = 0xfffffff8 - scan(vertexMappings.vertexOffset);

          const v: NLVertex = {
            address: structAddress,
            contentModeValue: scan(vertexMappings.nanContentModeFlag),
            contentMode: getPolygonType(vertexContentModeValue),
            vertexOffset,
            contentAddress: structAddress - vertexOffset,
            position: scan(vertexMappings.position),
            normals: scan(vertexMappings.normals, 'vertexNormals'),
            uv: scan(vertexMappings.uv)
          };
          scan.setBaseAddress(structAddress);

          if (v.contentMode == 'b') {
            v.vertexOffset = 0xfffffff8 - scan(vertexMappings.vertexOffset);
            v.contentAddress = structAddress - vertexOffset;
            scan.setBaseAddress(v.contentAddress);
          }

          polygon.vertexes.push(v);

          structAddress += v.contentMode === 'a' ? S.VERTEX_A : S.VERTEX_B;
          v.address = h(v.address);
          v.contentModeValue = h(v.contentModeValue);

          if (v.contentAddress) {
            v.contentAddress = h(v.contentAddress);
          }

          if (index === 9) {
            if (structAddress >= meshEndAddress) {
              detectedMeshEnd = true;
            }
          }
        }

        mesh.polygons.push(polygon);
      }

      model.meshes.push(mesh);
    }

    return model;
  } catch (error) {
    // @TODO: more thoughtful handling of errors
    console.trace(
      `${index}: error parsing model @ ` + toHexString(address),
      error
    );
    return {
      meshes: []
    };
  }
}
