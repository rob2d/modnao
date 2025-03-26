import { encodeZMortonPosition } from '@/utils/textures/parse';
import { NLUITextureDef, TextureDataUrlType } from '@/types/NLAbstractions';
import { decompressLzssBuffer } from '@/utils/data';
import textureFileTypeMap from '@/utils/textures/files/textureFileTypeMap';
import { LoadTexturesBasePayload } from '@/store/modelData';
import { rgba8888TargetOps } from '@/utils/color-conversions';

export type LoadTextureFileWorkerResult = {
  texturePixelBuffers: SharedArrayBuffer[];
  decompressedTextureBuffer: SharedArrayBuffer;
};

export type LoadTextureFileWorkerPayload = LoadTexturesBasePayload & {
  fileName: string;
  textureFileBuffer: SharedArrayBuffer;
  textureDefs: NLUITextureDef[];
};

const COLOR_SIZE = 2;
const urlTypes = ['opaque', 'translucent'] as TextureDataUrlType[];

function createTexturePixelBuffers(
  textureFileBuffer: SharedArrayBuffer,
  textureDefs: NLUITextureDef[],
  failOutOfBounds: boolean
): SharedArrayBuffer[] {
  const fileBuffer = Buffer.from(new Uint8Array(textureFileBuffer));

  const texturePixelBuffers: SharedArrayBuffer[] = [];

  textureDefs.forEach((t) => {
    const realLocation = t.baseLocation - t.ramOffset;
    for (const type of urlTypes) {
      const sharedPixelBuffer = new SharedArrayBuffer(t.width * t.height * 4);
      const pixels = new Uint8ClampedArray(sharedPixelBuffer);

      let hasPushed = false;

      for (let y = 0; y < t.height; y++) {
        if (hasPushed) {
          continue;
        }
        const yOffset = t.width * y;

        for (let offset = yOffset; offset < yOffset + t.width; offset += 1) {
          if (hasPushed) {
            continue;
          }
          const offsetDrawn = encodeZMortonPosition(offset - yOffset, y);
          const readOffset = realLocation + offsetDrawn * COLOR_SIZE;
          // textures may point out of bounds (this would be to RAM elsewhere in-game)
          if (readOffset >= fileBuffer.length && !failOutOfBounds) {
            texturePixelBuffers.push(new SharedArrayBuffer(0));
            console.error('texture buffer out of range');
            hasPushed = true;
            continue;
          }

          const colorValue = fileBuffer.readUInt16LE(readOffset);
          const conversionOp = rgba8888TargetOps[t.colorFormat];
          const color = conversionOp(colorValue);

          const canvasOffset = offset * 4;
          pixels[canvasOffset] = color.r;
          pixels[canvasOffset + 1] = color.g;
          pixels[canvasOffset + 2] = color.b;
          pixels[canvasOffset + 3] = type === 'translucent' ? color.a : 255;
        }
      }
      texturePixelBuffers.push(sharedPixelBuffer);
    }
  });

  return texturePixelBuffers;
}

export default function loadTextureFileWorker({
  textureFileBuffer,
  textureDefs,
  textureFileType,
  isLzssCompressed,
  /** @TODO streamline architecture so initial
   * call contains these attributes within the first call
   */
  resourceAttribs
}: LoadTextureFileWorkerPayload) {
  let result: LoadTextureFileWorkerResult;
  const expectOobReferences =
    textureFileTypeMap[textureFileType].oobReferencable;

  try {
    if (isLzssCompressed || resourceAttribs?.hasLzssTextureFile) {
      new Error('Decompressed File');
    }

    const texturePixelBuffers = createTexturePixelBuffers(
      textureFileBuffer,
      textureDefs,
      !expectOobReferences
    );

    result = {
      texturePixelBuffers,
      decompressedTextureBuffer: textureFileBuffer
    };
  } catch (error) {
    // if an overflow error occurs, this is an indicator that the
    // file loaded is compressed; this is common for certain
    // game texture formats like Capcom vs SNK 2;

    // @TODO use attrib hashes or resourceAtribs type ONLY -- doing
    // that partially hence fallback needed here to determine if
    // something should be compressed vs "clever" solution of dealing with
    // things here this way -- is somewhat of a crutch for now

    if (!(error instanceof RangeError)) {
      throw error;
    }

    const decompressedTextureBuffer = decompressLzssBuffer(textureFileBuffer);

    const texturePixelBuffers = createTexturePixelBuffers(
      decompressedTextureBuffer,
      textureDefs,
      !expectOobReferences
    );

    return {
      texturePixelBuffers,
      decompressedTextureBuffer,
      isLzssCompressed: true
    };
  }

  return result;
}
