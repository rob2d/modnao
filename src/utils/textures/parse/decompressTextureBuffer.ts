const WORD_SIZE = 2;

const BIT_FLAG = 0b1000000000000000;

export default function decompressTextureBuffer(buffer: Buffer) {
  const output: number[] = [];
  let applyBitMask = true;

  let bitmask = 0b0;
  let wordsBackCount = 0;
  let grabWordCount = 0;
  let extraWordCount = 0;
  let chunk = 0;

  for (let i = 0; i < buffer.length / WORD_SIZE; i++) {
    let value = buffer.readUInt16LE(i * WORD_SIZE);

    if (applyBitMask) {
      bitmask = value;
      applyBitMask = false;
      continue;
    }

    // reset this to be diffed on each loop
    extraWordCount = 0;
    const isCompressed = bitmask & (BIT_FLAG >> chunk);

    if (!isCompressed) {
      output.push(value);
    } else if (value === 0) {
      break;
    } else {
      // check that only the lower 11-bits are used;
      // this says it is a 4 byte value, where the number
      // of words back to go is value & 0x7ff
      const is32Bit = (value & 0b0111_1111_1111) === value;

      if (!is32Bit) {
        grabWordCount = (value >> 11) & 0b1111_1;
        wordsBackCount = value & 0b0111_1111_1111;
      } else {
        wordsBackCount = value;

        // advance/read an extra 2 bytes
        grabWordCount = buffer.readUInt16LE(++i * WORD_SIZE);

        // value now becomes 32-bit
        value = (value << 16) | grabWordCount;
      }

      if (wordsBackCount < grabWordCount) {
        extraWordCount = grabWordCount - wordsBackCount;
        grabWordCount = wordsBackCount;
      }

      const offset = output.length - wordsBackCount;
      const nextOutput = [];

      for (let j = 0; j < grabWordCount; j++) {
        nextOutput.push(output[offset + j]);
      }

      for (let j = 0; j < grabWordCount + extraWordCount; j++) {
        output.push(nextOutput[j % nextOutput.length]);
      }
    }

    chunk += 1;

    if (chunk == 0x10) {
      chunk = 0;
      applyBitMask = true;
    }
  }

  const outputBuffer = Buffer.from(new Uint8Array(output.length * 2));

  // we were working with 16-bit unsigned integers as source abstraction
  // for convenience, so need to split up the bytes again since JS API
  // Uint16Array does not store 16-bit values into buffer (instead will
  // truncate to 8-bit in the Buffer)
  output.forEach((v, i) => {
    const bytes = [];
    for (let i = 0; i < 2; i++) {
      bytes.push(v & 255);
      v >>= 8;
    }

    outputBuffer.set(bytes, i * 2);
  });

  return outputBuffer;
}
