/**
 * @returns an array of pointers for each available
 * model discovered
 */
export default function scanForModelPointers(
  buffer: Buffer
): [number[], number] {
  // get initial offset that will dictate how we can pull
  // textures/model data from files since typically they are loaded into RAM
  // before these ops in actual game-process on SH4
  const modelRamOffset = buffer.readUInt32LE(0x0000) & 0xffffff00;

  const modelTablePointer = buffer.readUInt32LE(0x0000) - modelRamOffset;

  const modelCount = buffer.readUInt32LE(0x0004);
  const modelPointers: number[] = [];

  for (let i = 0; i < modelCount; i++) {
    const pointer = modelTablePointer + 4 * i;
    try {
      modelPointers.push(buffer.readUInt32LE(pointer) - modelRamOffset);
    } catch (error) {
      console.error(`Error: error occurred scanning model at index ${i}`);
      console.error(error);
    }
  }

  return [modelPointers, modelRamOffset];
}
