import { kmeans } from '@thi.ng/k-means';
import {
  decodeZMortonPosition,
  RgbaColor,
  TextureColorFormat
} from '../textures';
import { rgb565ToRgba8888 } from '../color-conversions';

const WORD_SIZE = 2;
const VECTOR_LENGTH = 4;

/** @param buffer decompressed buffer to compress */
export default function compressVqBuffer(
  buffer: Buffer,
  imageFormat: TextureColorFormat
) {
  console.time('compressVqBuffer');

  const codewords: number[][] = [];

  for (let i = 0; i < buffer.length; i += 8) {
    const w1 = buffer.readUInt16LE(i);
    const w2 = buffer.length > i + 2 ? buffer.readUint16LE(i + 2) : 0;
    const w3 = buffer.length > i + 4 ? buffer.readUint16LE(i + 4) : 0;
    const w4 = buffer.length > i + 6 ? buffer.readUint16LE(i + 6) : 0;
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

  const clusters = kmeans(256, codewords);
  const indexWordMap = new Map<number, number>();

  //assemble indexes into lookup for writing back
  clusters.forEach((cluster: { items: number[] }, clusterIndex: number) => {
    // @TODO: also break into rgb565 word to streamline writing back
    cluster.items.forEach((item: number) => {
      indexWordMap.set(item, clusterIndex);
    });
  });

  console.timeEnd('compressVqBuffer');
}
