import { NLTextureDef } from '@/types/NLAbstractions';
import { NLTextureDefConversions } from './NLPropConversionDefs';
import { processNLConversions } from './processNLConversions';
import ramToRaw from './ramToRawAddress';

export default function scanPVRHeaderData(buffer: Buffer) {
  const pvrStartAddress = ramToRaw(buffer.readUInt32LE(0x8));
  const pvrEndAddress = ramToRaw(buffer.readUInt32LE(0x10));

  const textures: NLTextureDef[] = [];

  for (let address = pvrStartAddress; address < pvrEndAddress; address += 16) {
    textures.push(
      processNLConversions(NLTextureDefConversions, buffer, address)
    );
  }

  return textures;
}
