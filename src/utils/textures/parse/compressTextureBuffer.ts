const WORD_SIZE = 2;
const COMPRESSION_FLAG = 0b1000_0000_0000_0000;

export default function compressTextureBuffer(buffer: Buffer) {
  const output: number[] = [];
  let chunk = 0;

  const valueInstanceMap = new Map<number, number>();

  const processedFirstChunk = false;

  let i = 0;
  while (i < buffer.length / WORD_SIZE) {
    const value = buffer.readUInt16LE(i * WORD_SIZE);

    let repetitions = 1;

    // discover repetitions in next bytes read
    // being equal in decompressed buffer
    while (
      i + repetitions < buffer.length / WORD_SIZE &&
      buffer.readUInt16LE((i + repetitions) * WORD_SIZE) === value
    ) {
      repetitions++;
    }

        console.log(
          `@0x${(output.length * 2).toString(16)}, output will not be consumed`
        );

      // special case where chunk advances
      chunk++;
      continue;
    }

    // only repeats once, so store value
    // directly
    if (repetitions === 1) {
      for (let j = 0; j < repetitions; j++) {
        output.push(value);
      }
    }

    if (repetitions > 2) {
      // 32-bit compression
      // as repetitions do not fit within 5bit mask

      if (output.length < 100) {
        console.log(
          `@0x${(output.length * 2).toString(
            16
          )}, output has a compression flag`
        );
      }

      // mark compression bit based on chunk #
      output.push(COMPRESSION_FLAG >> chunk % 16);

      if (repetitions <= 0b11111) {
        // 16-bit
        // the number of words to grab are stored in 5 msb
        const repetitionBits = repetitions << 11;
        // the number of words to go back is stored in 11LSB
        const wordsBackCount = repetitions & 0b0111_1111_1111;

        output.push(repetitionBits | wordsBackCount);
      } else {
        // 32-bit
        output.push(repetitions & (0xffff << 16));

        output.push(repetitions & 0xffff);
      }
    }

    i += repetitions;
    chunk++;
  }

  const outputBuffer = Buffer.alloc(output.length * WORD_SIZE);
  for (let i = 0; i < output.length; i++) {
    outputBuffer.writeUInt16LE(output[i], i * WORD_SIZE);
  }

  return outputBuffer;
}
