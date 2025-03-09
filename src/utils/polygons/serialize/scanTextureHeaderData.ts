import { NLUITextureDef } from '@/types/NLAbstractions';
import { nlTextureDefConversions } from './NLPropConversionDefs';
import { processNLConversions } from './processNLConversions';

export default function scanTextureHeaderData(
  buffer: SharedArrayBuffer,
  modelRamOffset: number
) {
  const wBuffer = Buffer.from(new Uint8Array(buffer));
  const pvrStartAddress = wBuffer.readUInt32LE(0x8) - modelRamOffset;
  const pvrEndAddress = wBuffer.readUInt32LE(0x10) - modelRamOffset;

  let ramOffset;
  const textures: NLUITextureDef[] = [];
  for (let address = pvrStartAddress; address < pvrEndAddress; address += 16) {
    const texture = processNLConversions(
      nlTextureDefConversions,
      wBuffer,
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
      texture.bufferKeys = { opaque: '', translucent: '' };
      textures.push(texture);
    }
  }

  return textures;
}
