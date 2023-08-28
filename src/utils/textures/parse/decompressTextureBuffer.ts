const WORD_SIZE = 2;

/** starts at F000 and shifted for a mask check based on the chunk */
const COMPRESSION_FLAG = 0b1000_0000_0000_0000;

export default function decompressTextureBuffer(bufferPassed: Buffer) {
  const buffer = Buffer.from(bufferPassed);
  const output: number[] = [];
  let applyBitMask = true;

  let bitmask = 0b0;
  let wordsBackCount = 0;
  let grabWordCount = 0;
  let chunk = 0;

  for (let i = 0; i < buffer.length / WORD_SIZE; i++) {
    let word = buffer.readUInt16LE(i * WORD_SIZE);

    if (applyBitMask) {
      bitmask = word;
      applyBitMask = false;
      continue;
    }

    const isCompressed = bitmask & (COMPRESSION_FLAG >> chunk);
    let extraWordCount = 0;

    if (!isCompressed) {
      output.push(word);
    } else if (word === 0) {
      break;
    } else {
      // check that only the lower 11-bits are used;
      // this says it is a 4 byte value, where the number
      // of words back to go is value & 0x7ff
      const is32Bit = (word & 0b0111_1111_1111) === word;

      if (!is32Bit) {
        // the number of words to grab are in the 5 MSb
        grabWordCount = (word >> 11) & 0b1111_1;
        // the number of words to go back are in the 11 LSb
        wordsBackCount = word & 0b0111_1111_1111;
      } else {
        wordsBackCount = word;

        // advance/read an extra 2 bytes
        grabWordCount = buffer.readUInt16LE(++i * WORD_SIZE);

        // value now becomes 32-bit
        word = (word << 16) | grabWordCount;
      }

      if (wordsBackCount < grabWordCount) {
        extraWordCount = grabWordCount - wordsBackCount;
        grabWordCount = wordsBackCount;
      }

      const appendedSequence = output.slice(
        output.length - wordsBackCount,
        output.length - wordsBackCount + grabWordCount
      );

      for (let j = 0; j < grabWordCount + extraWordCount; j++) {
        output.push(appendedSequence[j % appendedSequence.length]);
      }
    }

    chunk += 1;

    // chunk loops every 2 bytes
    if (chunk == 0x10) {
      chunk = 0;
      applyBitMask = true;
    }
  }

  const outputBuffer = Buffer.from(new Uint8ClampedArray(output.length * 2));

  for (let i = 0; i < output.length; i++) {
    outputBuffer.writeUInt16LE(output[i], i * WORD_SIZE);
  }

  return outputBuffer;
}
