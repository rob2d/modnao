import S from './Sizes.mjs';
import getBufferMapper from './getBufferMapper.mjs';
import getPolygonType from './getPolygonType.mjs';
import getTextureWrappingFlags from './getTextureWrappingFlags.mjs';
import mappings from './modelMappings.mjs';
import { createHOffsetFn } from './referenceUtils.mjs';

const pMappings = mappings.mesh.polygon;
const vMappings = pMappings.vertex;

export default function scanModel({ address, buffer }) {
  const h = createHOffsetFn(address);
  const scan = getBufferMapper(buffer, address, true);

  const model = {};

  // model header
  model.address = address;
  model.position = scan(mappings.position);
  model.radius = scan(mappings.radius);

  try {
    // meshes within the model
    model.meshes = [];
    scan.setBaseAddress(address + S.MODEL_HEADER);

    let detectedModelEnd = false;
    let structAddress = address + S.MODEL_HEADER;

    while (structAddress < buffer.length && !detectedModelEnd) {
      model.meshes.push({});
      const mesh = model.meshes[model.meshes.length - 1];

      mesh.textureWrappingValue = scan(mappings.mesh.textureWrapping) >> 2;
      mesh.textureControlValue = scan(mappings.mesh.textureControlValue);
      mesh.textureColorFormat = scan(mappings.mesh.textureColorFormat);
      mesh.textureNumber = scan(mappings.mesh.textureNumber);
      mesh.specularLightValue = scan(mappings.mesh.specularLightValue);
      mesh.position = scan(mappings.mesh.position);
      mesh.alpha = scan(mappings.mesh.alpha);
      mesh.color = scan(mappings.mesh.color);
      mesh.polygonDataLength = scan(
        mappings.mesh.polygonDataLength,
        'polygonDataLength'
      );
      mesh.polygons = [];
      mesh.textureWrappingFlags = getTextureWrappingFlags(
        mappings.mesh.textureWrapping
      );

      const meshEndAddress =
        structAddress +
        mappings.mesh.polygonDataLength[0] +
        mesh.polygonDataLength;
      console.log('meshEndAddress ->', meshEndAddress - address);

      structAddress += S.MESH;

      // scan polygons within mesh
      while (
        structAddress < meshEndAddress &&
        structAddress < buffer.length &&
        !detectedModelEnd
      ) {
        scan.setBaseAddress(structAddress);

        console.log('structAddress ->', structAddress - address);

        let p = {
          address: structAddress,
          vertexCount: scan(pMappings.vertexCount),
          vertexGroupModeValue: scan(pMappings.vertexGroupMode)
        };

        // @TODO: verify this logic
        const binVertexGroup = [...p.vertexGroupModeValue.toString(2)]
          .reverse()
          .join()
          .padStart(8, '0');

        if (binVertexGroup[1] === '1' || p.vertexGroupModeValue === 0x0a) {
          p.vertexGroupMode = 'triple';
        } else {
          p.vertexGroupMode = 'regular';
        }

        const vertexCount =
          p.vertexCount * (p.vertexGroupMode == 'triple' ? 3 : 1);
        structAddress = p.address + 8;

        // scan vertexes
        let detectedMeshEnd = false;
        p.vertexes = [];

        console.log('mesh vertexes ----------');
        console.log('actualVertexCount ->', vertexCount);

        for (let i = 0; i < vertexCount; i++) {
          if (detectedMeshEnd) {
            console.log('detectedMeshEnd @ structAddress ', structAddress);
            break;
          }

          const v = {};
          v.address = structAddress;
          scan.setBaseAddress(structAddress);
          v.contentModeValue = scan(vMappings.nanContentModeFlag);
          v.contentMode = getPolygonType(v.contentModeValue);

          if (v.contentMode == 'b') {
            v.vertexOffset = 0xfffffff8 - scan(vMappings.vertexOffset);
            v.contentAddress = v.address - v.vertexOffset;
            scan.setBaseAddress(v.contentAddress);
          }

          v.position = scan(pMappings.vertex.position /*'vPosition' */);
          v.normals = scan(pMappings.vertex.normal /*'vertexNormal'*/);
          v.uv = scan(pMappings.vertex.uv /* 'vertexUv' */);

          p.vertexes.push(v);

          structAddress += v.contentMode === 'a' ? S.VERTEX_A : S.VERTEX_B;

          v.address = h(v.address);
          v.contentModeValue = h(v.contentModeValue, true);

          if (v.contentAddress) {
            v.contentAddress = h(v.contentAddress);
          }

          if (structAddress >= meshEndAddress) {
            detectedMeshEnd = true;
            console.log('read buffer ->', buffer.readUInt32LE(structAddress));
          }
        }

        model.meshes[model.meshes.length - 1].polygons.push(p);

        p.address = h(p.address);
        p.vertexGroupModeValue = h(p.vertexGroupModeValue, true);

        if (structAddress > buffer.length) {
          detectedModelEnd = true;
        }

        if (buffer.readUInt32LE(structAddress) === 0) {
          detectedModelEnd = true;
          structAddress += 4;
          model.vertexCount = buffer.readUInt32LE(structAddress);
          structAddress += 4;
        }
      }
    }
  } catch (error) {
    console.error('error parsing model ->', error);
  }

  return model;
}
