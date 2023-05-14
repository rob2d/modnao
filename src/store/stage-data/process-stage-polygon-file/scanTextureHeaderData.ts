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

    // there is usually a final empty extra texture
    // we can discard when scanning
    if (texture.width > 0) {
      // will be re-assigned when populating tex file
      texture.dataUrl = '';
      textures.push(texture);
    }
  }

  return textures;
}
