import LinkedList, { ListNode } from '@/utils/ds/LinkedList';

const WORD_SIZE = 2;

/** starts at MSB and right-shifted using chunk to indicate compression ops */
const COMPRESSION_FLAG = 0b1000_0000_0000_0000;

/**
 * in 16 bit mode, can look back a max of 5 bits
 */
const W16_MAX_LOOKBACK = 2048;

/**
 * @param buffer decompressed buffer to compress
 */
export default function compressTextureBuffer(buffer: Buffer) {
  console.time('compressTextureBuffer');
  let i = 0;

  // create a structure that maps sequences of word ops

  // also generate occurence maps for each word
  // to grab a linked list of indexes where it occurs

  const wordCount = buffer.length / WORD_SIZE;
  const values: (number | [number, number])[] = [];
  const bitmasks: number[] = [];

  /**
   * tracks word occurences at indexes
   */
  const wordOccurences: Map<number, LinkedList<number>> = new Map();

  let chunk = 0;
  let bitmask = 0;

  while (i < wordCount) {
    const word = buffer[i * WORD_SIZE] | (buffer[i * WORD_SIZE + 1] << 8);

    // add word occurence
    if (!wordOccurences.get(word)) {
      wordOccurences.set(word, new LinkedList<number>());
    }

    const occurenceList = wordOccurences.get(word) as LinkedList<number>;

    // clean up occurences not within targeted range
    occurenceList.append(i);
    while (
      occurenceList.head &&
      occurenceList.head.data <= i - W16_MAX_LOOKBACK
    ) {
      if (occurenceList.head.next === null) {
        break;
      }

      occurenceList.advanceHead();
    }

    let sequenceNode: ListNode<number> | null =
      occurenceList.head as ListNode<number>;

    let sequenceLength = 0;
    let sequenceIndex = -1;

    while (sequenceNode) {
      let length = 1;

      // for each starting word, travel through to see
      // if there is a matching sequence
      let hasMatch = true;

      while (
        hasMatch &&
        sequenceNode.data < i &&
        sequenceNode.data + length < wordCount &&
        i + length < wordCount &&
        length < W16_MAX_LOOKBACK - 1
      ) {
        const sI = (sequenceNode.data + length) * WORD_SIZE;
        const sequenceWord = buffer[sI] | (buffer[sI + 1] << 8);

        const nI = (i + length) * WORD_SIZE;
        const nextWord = buffer[nI] | (buffer[nI + 1] << 8);
        if (nextWord === sequenceWord) {
          length++;
        } else {
          hasMatch = false;
        }
      }

      if (length > sequenceLength) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sequenceIndex = sequenceNode!.data;
        sequenceLength = length;
      }

      sequenceNode = sequenceNode.next;
    }

    if (sequenceLength === 1) {
      values.push(word);
    } else {
      bitmask = bitmask | (COMPRESSION_FLAG >> chunk);
      values.push([i - sequenceIndex, sequenceLength]);
    }

    i += sequenceLength;

    chunk++;

    if (chunk === 16) {
      bitmasks.push(bitmask);
      bitmask = 0;
      chunk -= 16;
    }
  }

  chunk = 0;
  let bitmaskIndex = 0;
  let byteOffset = 0;
  let outputBuffer = Buffer.alloc(buffer.length);

  for (const value of values) {
    if (chunk === 0) {
      const value = bitmasks[bitmaskIndex++];
      outputBuffer.writeUInt16LE(value, byteOffset);
      byteOffset += 2;
    }

    if (!Array.isArray(value)) {
      outputBuffer.writeUInt16LE(value, byteOffset);
      byteOffset += 2;
    } else {
      const [wordsBack, length] = value;
      const is32Bit = length > 31 || wordsBack >= W16_MAX_LOOKBACK;

      if (!is32Bit) {
        outputBuffer.writeUInt16LE((length << 11) | wordsBack, byteOffset);
        byteOffset += 2;
      } else {
        outputBuffer.writeUInt16LE(wordsBack, byteOffset);
        byteOffset += 2;
        outputBuffer.writeUInt16LE(length, byteOffset);
        byteOffset += 2;
      }
    }

    chunk += 1;
    chunk %= 16;
  }

  if (bitmask > 0) {
    outputBuffer = outputBuffer.subarray(0, byteOffset + 2);
    outputBuffer.writeUInt16LE(0, byteOffset);
  } else {
    outputBuffer = outputBuffer.subarray(0, byteOffset);
  }

  console.timeEnd('compressTextureBuffer');
  return outputBuffer;
}
