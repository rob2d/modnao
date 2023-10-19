import { off } from 'process';
import { encodeZMortonPosition } from '../textures';
import { rgb565ToRgba8888, rgbaToRgb565 } from '../color-conversions';

const WORD_SIZE = 2;
const VECTOR_LENGTH = 4;
const CODEBOOK_SIZE = 256;
const CODEWORD_START = WORD_SIZE * VECTOR_LENGTH * CODEBOOK_SIZE;

export default function vectorDequantizeBuffer(
  bufferPassed: Buffer,
  w: number,
  h: number
) {
  const buffer = Buffer.from(bufferPassed);
  const codebook: number[][] = [];
  const output: number[] = new Array(w * h);

  try {
    for (let i = 0; i < CODEBOOK_SIZE; i++) {
      const entry = [];

      for (let j = 0; j < VECTOR_LENGTH; j++) {
        const position = (i * VECTOR_LENGTH + j) * WORD_SIZE;
        const word = buffer.readUInt16LE(position);
        entry.push(word);
      }
      codebook.push(entry);
    }

    for (let i = 0; i < buffer.length - CODEWORD_START; i += 1) {
      const codewords = buffer.readUInt8(i + CODEWORD_START);
      const vector = codebook[codewords];

      output[i * 4] = vector[0];
      output[i * 4 + 1] = vector[1];
      output[i * 4 + 2] = vector[2];
      output[i * 4 + 3] = vector[3];
    }
  } catch (error) {
    console.error(error);
  }

  const outputBuffer = Buffer.from(new Uint8ClampedArray(output.length * 2));

  for (let i = 0; i < output.length; i++) {
    outputBuffer.writeUInt16LE(output[i], i * WORD_SIZE);
  }

  return outputBuffer;
}
