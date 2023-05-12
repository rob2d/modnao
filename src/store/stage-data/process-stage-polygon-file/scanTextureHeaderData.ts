import ramToRaw from './ramToRawAddress';

const TEXTURE_OFFSET = 0x0cc00000;

export default function scanPVRHeaderData(buffer: Buffer) {
  const pvrStartAddress = ramToRaw(buffer.readUInt32LE(0x8));
  const pvrEndAddress = ramToRaw(buffer.readUInt32LE(0x10));

  const textures = [];

  // @TODO use Modnao NL parse definitions here for parsing + compiling
  for (let o = pvrStartAddress; o < pvrEndAddress; o += 16) {
    textures.push({
      width: buffer.readUInt16LE(o),
      height: buffer.readUInt16LE(o + 2),
      type: buffer.readUInt8(o + 4),
      format: buffer.readUInt8(o + 5),
      location: (buffer.readUInt32LE(o + 8) - TEXTURE_OFFSET).toString(16)
    });
  }

  console.log('textures ->', textures);
  return textures;
}
