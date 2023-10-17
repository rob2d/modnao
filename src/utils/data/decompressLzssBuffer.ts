const WORD_SIZE = 2;

/** starts at F000 and shifted for a mask check based on the chunk */
const COMPRESSION_FLAG = 0b1000_0000_0000_0000;

const BITS11 = 0b111_1111_1111;

export default function decompressLzssBuffer(bufferPassed: Buffer) {
  const buffer = Buffer.from(bufferPassed);
  const output: number[] = [];
  let applyBitmask = true;

  let bitmask = 0b0;
  let wordsBackCount = 0;
  let grabWordCount = 0;
  let chunk = 0;

  for (let i = 0; i < buffer.length / WORD_SIZE; i++) {
    const word = buffer.readUInt16LE(i * WORD_SIZE);

    if (applyBitmask) {
      bitmask = word;
      applyBitmask = false;
      continue;
    }

    const isCompressed = bitmask & (COMPRESSION_FLAG >> chunk);
    let extraWordCount = 0;

    if (!isCompressed) {
      output.push(word);
    } else if (word === 0) {
      break;
    } else {
      // if value (wordsBackCount) fits within 11 lsb,
      // this is a 32bit value
      const is32Bit = (word & BITS11) === word;

      if (!is32Bit) {
        // the number of words to grab are in the 5 MSb
        grabWordCount = (word >> 11) & 0b1_1111;
        // the number of words to go back are in the 11 LSb
        wordsBackCount = word & BITS11;
      } else {
        wordsBackCount = word;

        // advance/read an extra 2 bytes
        grabWordCount = buffer.readUInt16LE(++i * WORD_SIZE);
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
      applyBitmask = true;
    }
  }

  const outputBuffer = Buffer.from(new Uint8ClampedArray(output.length * 2));

  for (let i = 0; i < output.length; i++) {
    outputBuffer.writeUInt16LE(output[i], i * WORD_SIZE);
  }

  return outputBuffer;
}
