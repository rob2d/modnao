import LinkedList, { ListNode } from '@/utils/ds/LinkedList';

const WORD_SIZE = 2;

/** starts at MSB and right-shifted using chunk to indicate compression ops */
const COMPRESSION_FLAG = 0b1000_0000_0000_0000;

/**
 * max amount of words to look back for a sequence;
 * 2 to the 11th power; lsb value of 16 bit mode
 **/
const MAX_LOOKBACK = 2048;

/**
 * @param buffer decompressed buffer to compress
 */
export default function compressTextureBuffer(buffer: Buffer) {
  console.time('compressTextureBuffer');
  let i = 0;

  // (1) create a structure that maps sequences of first-word index, length,
  // and the index of the word that the sequence is repeated

  // also generates occurence maps for each word
  // to see where it shows up

  const wordCount = buffer.length / WORD_SIZE;
  const sequences: [number, number, number][] = [];
  /**
   * tracks word occurences at indexes
   */
  const wordOccurences: Map<number, LinkedList<number>> = new Map();

  const bitmasks: number[] = [];
  let chunk = 0;
  let bitmask = 0;

  while (i < wordCount) {
    const word = buffer.readUInt16LE(i * WORD_SIZE);

    // add word occurence
    if (!wordOccurences.get(word)) {
      wordOccurences.set(word, new LinkedList<number>());
    }

    const occurenceList = wordOccurences.get(word) as LinkedList<number>;
    occurenceList.append(i);

    // clean up occurences not within lookback range
    while (occurenceList.head && occurenceList.head.data < i - MAX_LOOKBACK) {
      if (occurenceList.head.next === null) {
        break;
      }

      occurenceList.removeAt(0);
    }

    let sequenceNode: ListNode<number> | null =
      occurenceList.head as ListNode<number>;
    let maxSequenceLength = 0;
    let maxSequenceIndex = -1;

    while (sequenceNode) {
      let length = 1;

      // for each word travel through to see
      // if there is a matching sequence
      let hasMatch = true;
      while (
        sequenceNode.data < i &&
        sequenceNode.data + length < wordCount &&
        length < 31 &&
        i + length < wordCount &&
        hasMatch
      ) {
        const sequenceWord = buffer.readUInt16LE(
          (sequenceNode.data + length) * WORD_SIZE
        );

        const nextWord = buffer.readUInt16LE((i + length) * WORD_SIZE);
        if (nextWord === sequenceWord) {
          length++;
        } else {
          hasMatch = false;
        }
      }

      if (length > maxSequenceLength) {
        maxSequenceIndex = sequenceNode!.data;
        maxSequenceLength = length;
      }

      sequenceNode = sequenceNode.next;
    }

    let lengthApplied = maxSequenceLength;
    let wordsBack = maxSequenceLength > 1 ? i - maxSequenceIndex : 0;

    if (maxSequenceLength > MAX_LOOKBACK) {
      wordsBack = 0;
      lengthApplied = 1;
    }

    sequences.push([word, lengthApplied, wordsBack]);
    i += lengthApplied;

    // indicate compression in bitmask for this chunk
    if (lengthApplied > 1) {
      bitmask = bitmask | (COMPRESSION_FLAG >> chunk);
    }

    // determine the bitmasks at appropriate chunks
    // and build value occurence maps for the decompressed
    // pixel data

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

  for (const [word, length, wordsBack] of sequences) {
    if (chunk === 0) {
      outputWords.push(bitmasks[bitmaskIndex++]);
    }

    if (length == 1) {
      outputWords.push(word);
    } else if (length > 1) {
      const grabWordCount = length << 11;
      outputWords.push(grabWordCount | wordsBack);
    }

    chunk += 1;
    chunk %= 16;
  }

  // end marker
  outputWords.push(0);

  // write to output buffer

  const outputBuffer = Buffer.from(
    new Uint8Array(outputWords.length * WORD_SIZE)
  );

  for (let i = 0; i < outputWords.length; i++) {
    const byteOffset = i * WORD_SIZE;

    if (byteOffset + WORD_SIZE <= outputBuffer.length) {
      outputBuffer.writeUInt16LE(outputWords[i], byteOffset);
    }
  }

  console.timeEnd('compressTextureBuffer');

  return outputBuffer;
}
