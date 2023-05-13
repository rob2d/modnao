import { NLTextureDef } from '@/types/NLAbstractions';
import { nlTextureDefConversions } from './NLPropConversionDefs';
import { processNLConversions } from './processNLConversions';
import ramToRaw from './ramToRawAddress';

export default function scanPVRHeaderData(buffer: Buffer) {
  const pvrStartAddress = ramToRaw(buffer.readUInt32LE(0x8));
  const pvrEndAddress = ramToRaw(buffer.readUInt32LE(0x10));

  const textures: NLTextureDef[] = [];

  for (let address = pvrStartAddress; address < pvrEndAddress; address += 16) {
    const texture = processNLConversions(
      nlTextureDefConversions,
      buffer,
      address
    );

    texture.imageCanvas = document.createElement('canvas');
    texture.imageCanvas.width = texture.width;
    texture.imageCanvas.height = texture.height;
    textures.push(texture);
  }

  console.log('textures ->', textures);

  return textures;
}
