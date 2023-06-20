const WORD_SIZE = 2;
const COMPRESSION_FLAG = 0b1000000000000000;

export default function compressTextureBuffer(buffer: Buffer) {
  const output: number[] = [];
  const bitmask = 0b0;
  let chunk = 0;

  for (let i = 0; i < buffer.length / WORD_SIZE; i++) {
    const value = buffer.readUInt16LE(i * WORD_SIZE);

    let repetitions = 0;

    // look ahead for repetitions in the current value scanned
    while (buffer.readUInt16LE((i + repetitions) * WORD_SIZE) !== value) {
      repetitions++;
    }

    if (repetitions) {
      // flag to indicate there is compression
      output.push(COMPRESSION_FLAG >> chunk);

      // @TODO reverse the logic to unwrap repeat values
    }

    // advance pointer by repetitions
    i += repetitions;
    chunk++;

    if (chunk === WORD_SIZE * 8) {
      chunk = 0;
    }
  }

  const outputBuffer = Buffer.alloc(output.length * WORD_SIZE);
  for (let i = 0; i < output.length; i++) {
    outputBuffer.writeUInt16LE(output[i], i * WORD_SIZE);
  }

  return outputBuffer;
}
