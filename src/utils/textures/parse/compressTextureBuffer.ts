// NOTE: this compression logic is a WIP/not actively consumed
// in the application yet. Will revisit algo as it must support
// repeated sequences between 2 to 31 words

const WORD_SIZE = 2;

/** starts at F000 and shifted for a mask check based on the chunk */
const COMPRESSION_FLAG = 0b1000_0000_0000_0000;

export default function compressTextureBuffer(buffer: Buffer) {
  const output: number[] = [];
  let chunk = 0;

  const valueInstanceMap = new Map<number, number>();

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

    // only repeats once, so store value
    // directly
    if (repetitions <= 2) {
      for (let j = 0; j < repetitions; j++) {
        if (chunk++ % 16 === 0) {
          // store first value saying chunk is not compressed
          output.push(0);
        }
        output.push(value);
      }
    }

    if (repetitions > 2) {
      // 32-bit compression
      // as repetitions do not fit within 5bit mask

      if (output.length < 60) {
        console.log(
          `@0x${(output.length * 2).toString(
            16
          )} will have compression flag written: 0b${(
            COMPRESSION_FLAG >>
            chunk % 16
          ).toString(2)} for ${repetitions} repeated words of ${value}`
        );
      }

      // mark compression bit based on chunk #
      output.push(COMPRESSION_FLAG >> chunk % 16);

      if (repetitions <= 0b11111) {
        // 16-bit
        // the number of words to grab are stored in 5 MSb
        const repetitionBits = repetitions << 11;
        // the number of words to go back is stored in 11LSb
        const wordsBackCount = repetitions & 0b0111_1111_1111;

        output.push(repetitionBits | wordsBackCount);
      } else {
        // 32-bit
        output.push(repetitions & (0xffff << 16));

        output.push(repetitions & 0xffff);
      }
      chunk++;
    }

    i += repetitions;
  }

  const outputBuffer = Buffer.alloc(output.length * WORD_SIZE);
  for (let i = 0; i < output.length; i++) {
    outputBuffer.writeUInt16LE(output[i], i * WORD_SIZE);
  }

  return outputBuffer;
}
