import { rgbaToArgb4444 } from '../color-conversions';
import { VQ_CODEBOOK_BYTE_SIZE } from '../textures/VqFormatConstants';
import compressVqBuffer from './compressVqBuffer';

describe('compressVqBuffer', () => {
  it('preserves discrete ARGB4444 alpha values without pseudo alpha', () => {
    const sourceBuffer = Buffer.alloc(256 * 4 * 2);

    for (let vectorIndex = 0; vectorIndex < 256; vectorIndex += 1) {
      const baseOffset = vectorIndex * 4 * 2;
      const transparentWord = rgbaToArgb4444({
        r: vectorIndex,
        g: 0,
        b: 0,
        a: 0
      });
      const opaqueWord = rgbaToArgb4444({
        r: 255 - vectorIndex,
        g: 255,
        b: 255,
        a: 255
      });

      sourceBuffer.writeUInt16LE(transparentWord, baseOffset);
      sourceBuffer.writeUInt16LE(opaqueWord, baseOffset + 2);
      sourceBuffer.writeUInt16LE(transparentWord, baseOffset + 4);
      sourceBuffer.writeUInt16LE(opaqueWord, baseOffset + 6);
    }

    const compressedBuffer = compressVqBuffer(sourceBuffer, 'ARGB4444');
    const codebookBuffer = compressedBuffer.subarray(0, VQ_CODEBOOK_BYTE_SIZE);

    for (let offset = 0; offset < codebookBuffer.length; offset += 2) {
      const alpha = codebookBuffer.readUInt16LE(offset) >> 12;

      expect([0, 15]).toContain(alpha);
    }
  });
});
