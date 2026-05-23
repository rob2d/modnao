import { kmeans } from 'ml-kmeans';
import {
  argb1555ToRgba8888,
  argb4444ToRgba8888,
  rgb565ToRgba8888,
  rgbaToArgb1555,
  rgbaToArgb4444,
  rgbaToRgb565
} from '../color-conversions';
import type { RgbaColor } from '../textures/RgbaColor';
import type { TextureColorFormat } from '../textures/TextureColorFormat';
import {
  TEXTURE_COLOR_SIZE,
  VQ_CODEBOOK_ENTRY_COUNT,
  VQ_CODEBOOK_VECTOR_LENGTH
} from '../textures/VqFormatConstants';

const OPAQUE_ALPHA = 255;

const averageValue = 127;

interface VqColorFormatOps {
  includeAlpha: boolean;
  readWord: (word: number) => RgbaColor;
  writeWord: (color: RgbaColor) => number;
}

const colorFormatOps: Partial<Record<TextureColorFormat, VqColorFormatOps>> = {
  RGB565: {
    includeAlpha: false,
    readWord: rgb565ToRgba8888,
    writeWord: rgbaToRgb565
  },
  ARGB1555: {
    includeAlpha: true,
    readWord: argb1555ToRgba8888,
    writeWord: rgbaToArgb1555
  },
  ARGB4444: {
    includeAlpha: true,
    readWord: argb4444ToRgba8888,
    writeWord: rgbaToArgb4444
  }
};

const getModeAlpha = (
  colors: RgbaColor[][],
  indexes: number[],
  slot: number
): number => {
  const alphaCounts = new Map<number, number>();

  indexes.forEach((index) => {
    const alpha = colors[index][slot].a;
    alphaCounts.set(alpha, (alphaCounts.get(alpha) ?? 0) + 1);
  });

  let modeAlpha = OPAQUE_ALPHA;
  let modeCount = 0;

  alphaCounts.forEach((count, alpha) => {
    if (count > modeCount) {
      modeAlpha = alpha;
      modeCount = count;
    }
  });

  return modeAlpha;
};

/** @param buffer decompressed buffer to compress */
export default function compressVqBuffer(
  buffer: Buffer,
  colorFormat: TextureColorFormat = 'RGB565'
): Buffer {
  console.time('compressVqBuffer');

  const ops = colorFormatOps[colorFormat];

  if (!ops) {
    throw new Error(`Unsupported VQ color format: ${colorFormat}`);
  }

  const codewords: number[][] = [];
  const codewordColors: RgbaColor[][] = [];
  const componentCount = ops.includeAlpha ? 4 : 3;

  for (
    let i = 0;
    i < buffer.length;
    i += VQ_CODEBOOK_VECTOR_LENGTH * TEXTURE_COLOR_SIZE
  ) {
    const colors = [...Array(VQ_CODEBOOK_VECTOR_LENGTH).keys()].map((slot) => {
      const offset = i + slot * TEXTURE_COLOR_SIZE;
      const word = buffer.length > offset ? buffer.readUInt16LE(offset) : 0;

      return ops.readWord(word);
    });

    const codeword = colors.flatMap((color) =>
      ops.includeAlpha
        ? [color.r, color.g, color.b, color.a]
        : [color.r, color.g, color.b]
    );

    codewords.push(codeword);
    codewordColors.push(colors);
  }

  const { clusters, centroids } = kmeans(codewords, VQ_CODEBOOK_ENTRY_COUNT, {
    maxIterations: 10
  });
  const indexWordMap = new Map<number, number>();
  const clusteredIndexes = [...Array(centroids.length).keys()].map(
    () => [] as number[]
  );
  const codebook: RgbaColor[][] = [];

  clusters.forEach((clusterIndex, itemIndex) => {
    indexWordMap.set(itemIndex, clusterIndex);
    clusteredIndexes[clusterIndex].push(itemIndex);
  });

  centroids.forEach((centroid, clusterIndex) => {
    const codebookEntry: RgbaColor[] = [];

    for (let slot = 0; slot < VQ_CODEBOOK_VECTOR_LENGTH; slot += 1) {
      const offset = slot * componentCount;
      codebookEntry.push({
        r: centroid[offset],
        g: centroid[offset + 1],
        b: centroid[offset + 2],
        a: !ops.includeAlpha
          ? OPAQUE_ALPHA
          : getModeAlpha(codewordColors, clusteredIndexes[clusterIndex], slot)
      });
    }

    codebook.push(codebookEntry);
  });

  while (codebook.length < VQ_CODEBOOK_ENTRY_COUNT) {
    codebook.push(
      [...Array(VQ_CODEBOOK_VECTOR_LENGTH).keys()].map(() => ({
        r: averageValue,
        g: averageValue,
        b: averageValue,
        a: OPAQUE_ALPHA
      }))
    );
  }

  const outputBytes: number[] = [];

  codebook.forEach((codebookEntry) => {
    codebookEntry.forEach((color) => {
      const word = ops.writeWord(color);

      outputBytes.push(word & 0xff);
      outputBytes.push((word >> 8) & 0xff);
    });
  });

  for (let i = 0; i < indexWordMap.size; i++) {
    outputBytes.push(indexWordMap.get(i) || 0);
  }

  const outputBuffer = Buffer.from(outputBytes);

  console.timeEnd('compressVqBuffer');
  return outputBuffer;
}
