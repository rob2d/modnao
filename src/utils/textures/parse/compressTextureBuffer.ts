const WORD_SIZE = 2;
/** starts at F000 and right-shifted using chunk to indicate compression ops */
const COMPRESSION_FLAG = 0b1000_0000_0000_0000;

/**
 * @param buffer decompressed buffer to compress
 */
export default function compressTextureBuffer(buffer: Buffer) {
  let i = 0;

  // (1) create a structure that maps each word
  // to the number of times it repeats; these are
  // essentially chunks of data which can be used
  // to help generate a compressed output

  const wordCount = buffer.length / WORD_SIZE;
  const wordSequences: [number, number][] = [];

  while (i < wordCount) {
    const word = buffer.readUInt16LE(i * WORD_SIZE);
    let repetitions = 0;
    if ((i + 1) * WORD_SIZE > buffer.length) {
      let nextWord = buffer.readUInt16LE((i + 1) * WORD_SIZE);

      while (
        i + 1 + repetitions < wordCount &&
        nextWord === word &&
        repetitions < 31
      ) {
        repetitions++;

        if (i + 1 + repetitions < wordCount) {
          nextWord = buffer.readUInt16LE((i + 1 + repetitions) * WORD_SIZE);
        }
      }
    }

    wordSequences.push([word, repetitions]);
    i += 1 + repetitions;
  }

  // (2) determine the bitmasks at appropriate chunks

  const bitmasks = [];
  let chunk = 0;
  let bitmask = 0;

  for (const [word, repetitions] of wordSequences) {
    // indicate compression in bitmask for this chunk
    if (repetitions > 0) {
      bitmask = bitmask | (COMPRESSION_FLAG >> chunk);
    }

    chunk++;
    chunk = chunk % 16;

    if (chunk === 0) {
      bitmasks.push(bitmask);
      bitmask = 0;
    }
  }

  // (3) assemble the output of bitmasks and words/repetitions

  const outputWords: number[] = [];

  chunk = 0;
  let bitmaskIndex = 0;

  for (const [word, repetitions] of wordSequences) {
    if (chunk === 0) {
      outputWords.push(bitmasks[bitmaskIndex++]);
    }

    outputWords.push(word);

    if (repetitions > 0) {
      // for 16-bit, this calculation is
      // always pretty staightforward as we
      // only go back 1 color for [repetition] times,

      // but break this down for clarity
      // to expand into 32-bit values later

      const grabWordCount = repetitions << 11;
      const wordsBackCount = 1;
      outputWords.push(grabWordCount | wordsBackCount);
    }

    chunk += 1;
    chunk %= 16;
  }

  // (4) write to output buffer

  const outputBuffer = Buffer.from(
    new Uint8Array(outputWords.length * WORD_SIZE)
  );

  for (let i = 0; i < outputWords.length; i++) {
    // Calculate the byte offset for writing
    const byteOffset = i * WORD_SIZE;

    // Check if the byte offset is within bounds of the buffer
    if (byteOffset + WORD_SIZE <= outputBuffer.length) {
      outputBuffer.writeUInt16LE(outputWords[i], byteOffset);
    } else {
      console.error('Error: Out of bounds');
    }
  }

  return outputBuffer;
}
