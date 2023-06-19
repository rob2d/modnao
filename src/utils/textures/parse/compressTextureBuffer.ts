const WORD_SIZE = 2;

export default function compressTextureBuffer(buffer: Buffer) {
  const output: number[] = [];
  let bitmask = 0b0;
  let chunk = 0;
  let wordsBackCount = 0;

  for (let i = 0; i < buffer.length / WORD_SIZE; i++) {
    const value = buffer.readUInt16LE(i * WORD_SIZE);

    if (chunk === 0) {
      output.push(bitmask);
      bitmask = 0b0;
    }

    if (wordsBackCount > 0) {
      output.push((wordsBackCount << 11) | (wordsBackCount - 1));
      wordsBackCount--;
    } else {
      output.push(value);
    }

    const isCompressed = value === output[output.length - 1];

    bitmask |= (isCompressed ? 1 : 0) << (0x0f - chunk);

    chunk++;
    if (chunk === 0x10) {
      chunk = 0;
    }

    if (isCompressed) {
      const repeatCount = Math.min(i, 0x0fff);
      wordsBackCount = repeatCount;
    }
  }

  const outputBuffer = Buffer.alloc(output.length * WORD_SIZE);

  for (let i = 0; i < output.length; i++) {
    outputBuffer.writeUInt16LE(output[i], i * WORD_SIZE);
  }

  return outputBuffer;
}
