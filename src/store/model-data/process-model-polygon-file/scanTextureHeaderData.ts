import { NLTextureDef } from '@/types/NLAbstractions';
import { nlTextureDefConversions } from './NLPropConversionDefs';
import { processNLConversions } from './processNLConversions';

export default function scanTextureHeaderData(
  buffer: Buffer,
  modelRamOffset: number
) {
  const pvrStartAddress = buffer.readUInt32LE(0x8) - modelRamOffset;
  const pvrEndAddress = buffer.readUInt32LE(0x10) - modelRamOffset;

  let ramOffset;
  const textures: NLTextureDef[] = [];
  for (let address = pvrStartAddress; address < pvrEndAddress; address += 16) {
    const texture = processNLConversions(
      nlTextureDefConversions,
      buffer,
      address
    );

    if (!ramOffset) {
      ramOffset = texture.baseLocation;
    }

    texture.ramOffset = ramOffset;

    // this may get overwritten based on mesh-usage when they are populated

    // there is usually a final empty extra texture
    // we can discard when scanning
    if (texture.width > 0) {
      // will be re-assigned when populating tex file
      texture.dataUrls = { opaque: '', translucent: '' };
      textures.push(texture);
    }
  }

  return textures;
}
