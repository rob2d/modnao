import {
  TEXTURE_COLOR_SIZE,
  VQ_CODEBOOK_BYTE_SIZE,
  VQ_CODEBOOK_ENTRY_COUNT,
  VQ_CODEBOOK_VECTOR_LENGTH
} from '../textures/VqFormatConstants';

export default function decompressVqBuffer(
  bufferPassed: Buffer,
  w: number,
  h: number
) {
  const buffer = Buffer.from(bufferPassed);
  const codebook: number[][] = [];
  const output: number[] = new Array(w * h);

  try {
    for (let i = 0; i < VQ_CODEBOOK_ENTRY_COUNT; i++) {
      const entry = [];

      for (let j = 0; j < VQ_CODEBOOK_VECTOR_LENGTH; j++) {
        const position =
          (i * VQ_CODEBOOK_VECTOR_LENGTH + j) * TEXTURE_COLOR_SIZE;
        const word = buffer.readUInt16LE(position);
        entry.push(word);
      }
      codebook.push(entry);
    }

    for (let i = 0; i < buffer.length - VQ_CODEBOOK_BYTE_SIZE; i += 1) {
      const codewords = buffer.readUInt8(i + VQ_CODEBOOK_BYTE_SIZE);
      const vector = codebook[codewords];

      for (let j = 0; j < VQ_CODEBOOK_VECTOR_LENGTH; j++) {
        output[i * VQ_CODEBOOK_VECTOR_LENGTH + j] = vector[j];
      }
    }
  } catch (error) {
    console.error(error);
  }

  const outputBuffer = Buffer.alloc(output.length * TEXTURE_COLOR_SIZE);

  for (let i = 0; i < output.length; i++) {
    outputBuffer.writeUInt16LE(output[i], i * TEXTURE_COLOR_SIZE);
  }

  return outputBuffer;
}
