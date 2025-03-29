import { kmeans } from '@thi.ng/k-means';
import { rgb565ToRgba8888, rgbaToRgb565 } from '../color-conversions';

const WORD_SIZE = 2;
const VECTOR_LENGTH = 4;

const averageValues = [
  127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127
];

/** @param buffer decompressed buffer to compress */
export default function compressVqBuffer(buffer: Buffer) {
  console.time('compressVqBuffer');

  const codewords: number[][] = [];

  for (let i = 0; i < buffer.length; i += VECTOR_LENGTH * WORD_SIZE) {
    const w1 = buffer.readUInt16LE(i);
    const w2 = buffer.length > i + 2 ? buffer.readUint16LE(i + WORD_SIZE) : 0;
    const w3 =
      buffer.length > i + 4 ? buffer.readUint16LE(i + 2 * WORD_SIZE) : 0;
    const w4 =
      buffer.length > i + 6 ? buffer.readUint16LE(i + 3 * WORD_SIZE) : 0;
    const c1 = rgb565ToRgba8888(w1);
    const c2 = rgb565ToRgba8888(w2);
    const c3 = rgb565ToRgba8888(w3);
    const c4 = rgb565ToRgba8888(w4);

    const codeword = [
      c1.r,
      c1.g,
      c1.b,
      c2.r,
      c2.g,
      c2.b,
      c3.r,
      c3.g,
      c3.b,
      c4.r,
      c4.g,
      c4.b
    ];

    codewords.push(codeword);
  }

  const clusters = kmeans(256, codewords, { maxIter: 10 });
  const indexWordMap = new Map<number, number>();
  const codebook: number[][] = [];

  //assemble indexes into lookup for writing back
  clusters.forEach((cluster, clusterIndex: number) => {
    const codebookEntry = [];

    for (let i = 0; i < 12; i += 3) {
      codebookEntry.push(
        cluster.centroid[i],
        cluster.centroid[i + 1],
        cluster.centroid[i + 2]
      );
    }

    codebook.push(codebookEntry);

    cluster.items.forEach((item: number) => {
      indexWordMap.set(item, clusterIndex);
    });
  });

  while (codebook.length < 256) {
    // eslint-disable-next-line prettier/prettier
    codebook.push(averageValues);
  }

  const outputBytes: number[] = new Array(256 * 12 + indexWordMap.size);

  // write initial codebook
  const rgba = { r: 0, g: 0, b: 0, a: 255 };
  let byteIndex = 0;
  codebook.forEach((codebookEntry) => {
    for (let i = 0; i < 12; i += 3) {
      rgba.r = codebookEntry[i];
      rgba.g = codebookEntry[i + 1];
      rgba.b = codebookEntry[i + 2];
      const rgb565 = rgbaToRgb565(rgba);

      outputBytes[byteIndex++] = rgb565 & 0xff;
      outputBytes[byteIndex++] = (rgb565 >> 8) & 0xff;
    }
  });

  for (let i = 0; i < indexWordMap.size; i++) {
    outputBytes.push(indexWordMap.get(i) || 0);
  }

  const outputBuffer = Buffer.from(outputBytes);

  console.timeEnd('compressVqBuffer');
  return outputBuffer;
}
