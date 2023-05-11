import ramToRawAddress from './ramToRawAddress';

/**
 * @returns an array of pointers for each available
 * model discovered
 */
export default function scanForModelPointers(buffer: Buffer) {
  const modelTablePointer = ramToRawAddress(buffer.readUInt32LE(0x0000));
  const modelCount = buffer.readUInt32LE(0x0004);
  const modelPointers: number[] = [];

  for (let i = 0; i < modelCount; i++) {
    const pointer = modelTablePointer + 4 * i;

    try {
      modelPointers.push(ramToRawAddress(buffer.readUInt32LE(pointer)));
    } catch (error) {
      console.error(`Error: error occurred scanning model at index ${i}`);
      console.error(error);
    }
  }

  return modelPointers;
}
