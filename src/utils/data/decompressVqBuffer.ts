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

      for (let j = 0; j < 4; j++) {
        try {
          const position = i * j * 2;
          const word = buffer.readUInt16LE(position);
          entry.push(word);
        } catch (error) {
          console.error('buffer length ->', buffer.length, 'i ->', i);
        }
      }

      codebook.push(entry);
    }

    const encode = (i) => encodeZMortonPosition(i % w, Math.floor(i / w));

    for (let i = 0; i < buffer.length - CODEWORD_START; i += 1) {
      try {
        const codewords = buffer.readUInt8(i + CODEWORD_START);
        const vector = codebook[codewords];
        const ai = i * 4;
        const bi = i * 4 + 1;
        const ci = i * 4 + 2;
        const di = i * 4 + 3;
        const max = Math.pow(2, 16) - 1;

        const intensity = vector[0];
        output[ai] = vector[0];
        output[bi] = vector[1];
        output[ci] = vector[2];
        output[di] = vector[3];
      } catch (error) {
        console.log('error at i ->', i);
        console.log('error ->', error);
      }
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
