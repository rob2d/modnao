import { NLMesh } from '@/store/stageDataSlice';
import S from './Sizes';
import getBufferMapper from './getBufferMapper';
import ModelMappings from './ModelMappings';
import getTextureWrappingFlags from './getTextureWrappingFlags';

export default function scanModel({
  address,
  buffer
}: {
  address: number;
  buffer: Buffer;
}) {
  const h = (offset: number) => address - offset;
  const scan = getBufferMapper(buffer, address, false);

  const modelBase = {
    address,
    position: scan(ModelMappings.position),
    radius: scan(ModelMappings.radius)
  };

  try {
    const meshes = [];
    scan.setBaseAddress(address + S.MODEL_HEADER);

    const detectedModelEnd = false;
    const structAddress = address + S.MODEL_HEADER;

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

      meshes.push(mesh);
    }

    // TODO: calculate polys
    return {
      ...modelBase,
      meshes
    };
  } catch (error) {}
}
