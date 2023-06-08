const WORD_SIZE = 2;

export default function decompressTextureBuffer(buffer: Buffer) {
  const output: number[] = [];
  let applyBitMask = true;

  let bitmask = 0b0;
  let wordsBackCount = 0;
  let grabWordsCount = 0;
  let extraWordsCount = 0;
  let chunk = 0;

  for (let i = 0; i < buffer.length / WORD_SIZE; i++) {
    let value = buffer.readUInt16LE(i * WORD_SIZE);

    if (applyBitMask) {
      bitmask = value;
      applyBitMask = false;
      continue;
    }

    // reset this to be diffed on each loop
    extraWordsCount = 0;
    const isCompressed = (bitmask & (0x8000 >> chunk)) != 0;
    if (isCompressed) {
      if (value === 0) {
        break;
      }

      // advance 4 bytes
      if ((value & 0x7ff) === value) {
        wordsBackCount = value;

        try {
          if (i * WORD_SIZE > buffer.length) {
            console.error('ACCESSING BAD INDEX @', i);
          }
          i++;
          grabWordsCount = buffer.readUInt16LE(i * WORD_SIZE);
        } catch (error) {
          console.error('ERROR grabbing px @', i);
        }
        value = (value << 16) | grabWordsCount;
      }
      // advance 2 bytes
      else {
        grabWordsCount = (value & 0xf800) >> 11;
        wordsBackCount = value & 0x07ff;
      }

      if (wordsBackCount < grabWordsCount) {
        extraWordsCount = grabWordsCount - wordsBackCount;
        grabWordsCount = wordsBackCount;
      }

      const offset = output.length - wordsBackCount;
      const nextOutput = [];

      for (let j = 0; j < grabWordsCount; j++) {
        nextOutput.push(output[offset + j]);
      }

      for (let j = 0; j < grabWordsCount + extraWordsCount; j++) {
        output.push(nextOutput[j % nextOutput.length]);
      }
    }

    if (!isCompressed) {
      output.push(value);
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
