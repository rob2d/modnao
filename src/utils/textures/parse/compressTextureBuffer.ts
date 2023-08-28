const WORD_SIZE = 2;
/** starts at F000 and right-shifted using chunk to indicate compression ops */
const COMPRESSION_FLAG = 0b1000_0000_0000_0000;

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
    let nextWord = buffer.readUInt16LE((i + 1) * WORD_SIZE);

    while (
      i + repetitions + 1 < wordCount &&
      nextWord === word &&
      repetitions < 31
    ) {
      repetitions++;
      nextWord = buffer.readUInt16LE((i + repetitions) * WORD_SIZE);
    }

    wordSequences.push([word, repetitions]);
    i += repetitions + 1;
  }

  // (2) next, determine bitmasks at appropriate chunks

  const bitmasks = [];
  let chunk = 0;
  let bitmask = 0;

  for (const [_, repetitions] of wordSequences) {
    if (repetitions > 0) {
      bitmask = bitmask | (COMPRESSION_FLAG >> chunk % 16);
    }

    chunk++;

    if (chunk % 16 === 0 && chunk > 0) {
      bitmasks.push(bitmask);
      bitmask = 0;
    }
  }

  // (3) assemble the output of bitmasks and words/repetitions

  const outputWords: number[] = [];

  chunk = 0;
  for (const [word, repetitions] of wordSequences) {
    if (chunk % 16 === 0) {
      outputWords.push(bitmasks.shift() || 0);
    }

    chunk += 1;
    if (repetitions === 0) {
      outputWords.push(word);
    } else {
      // for 16-bit, this calculation is
      // always pretty staightforward as
      // words grabbed === words back,
      // but break this down for clarity
      // to expand into 32-bit values later

      if (repetitions > 31) {
        console.log('repetitions is greater than 31 ->', repetitions);
      }

      const grabWordCount = repetitions << 11;
      const wordsBackCount = repetitions;
      outputWords.push(grabWordCount | wordsBackCount);
    }
  }

  // (4) write to output buffer

  const outputBuffer = Buffer.from(
    new ArrayBuffer(outputWords.length * WORD_SIZE)
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
