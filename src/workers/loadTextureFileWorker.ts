import { Image } from 'image-js';
import { encodeZMortonPosition } from '@/utils/textures/parse';
import { NLUITextureDef, TextureDataUrlType } from '@/types/NLAbstractions';
import { bufferToObjectUrl, decompressLzssBuffer } from '@/utils/data';
import { ResourceAttribs } from '@/types/ResourceAttribs';
import textureFileTypeMap, {
  TextureFileType
} from '@/utils/textures/files/textureFileTypeMap';
import { LoadTexturesBasePayload } from '@/store/modelData';
import { rgba8888TargetOps } from '@/utils/color-conversions';

export type LoadTextureFileWorkerResult = {
  textureDefs: NLUITextureDef[];
  textureFileType: TextureFileType;
  fileName: string;
  isLzssCompressed: boolean;
  textureBufferUrl: string;
  resourceAttribs?: ResourceAttribs;
};

export type LoadTextureFileWorkerPayload = LoadTexturesBasePayload & {
  buffer: SharedArrayBuffer;
};

const COLOR_SIZE = 2;

async function loadTextureBuffer(
  bufferPassed: SharedArrayBuffer,
  textureDefs: NLUITextureDef[],
  failOutOfBounds: boolean
): Promise<{ textureDefs: NLUITextureDef[] }> {
  const buffer = Buffer.from(new Uint8Array(bufferPassed) as Uint8Array);
  const nextTextureDefs: NLUITextureDef[] = [];

  const texturePromises = textureDefs.map(async (t) => {
    const urlTypes = Object.keys(t.bufferUrls) as TextureDataUrlType[];
    const updatedTexture = { ...t };

    for await (const type of urlTypes) {
      const sharedPixels = new SharedArrayBuffer(t.width * t.height * 4);
      const pixels = new Uint8ClampedArray(sharedPixels);

      for (let y = 0; y < t.height; y++) {
        const yOffset = t.width * y;

        for (let offset = yOffset; offset < yOffset + t.width; offset += 1) {
          const offsetDrawn = encodeZMortonPosition(offset - yOffset, y);
          const readOffset =
            t.baseLocation - t.ramOffset + offsetDrawn * COLOR_SIZE;
          // textures may point out of bounds (this would be to RAM elsewhere in-game)
          if (readOffset >= buffer.length && !failOutOfBounds) {
            break;
          }

          const colorValue = buffer.readUInt16LE(readOffset);
          const conversionOp = rgba8888TargetOps[t.colorFormat];
          const color = conversionOp(colorValue);

          const canvasOffset = offset * 4;
          pixels[canvasOffset] = color.r;
          pixels[canvasOffset + 1] = color.g;
          pixels[canvasOffset + 2] = color.b;
          pixels[canvasOffset + 3] = type === 'translucent' ? color.a : 255;
        }
      }

      const objectUrl = await bufferToObjectUrl(sharedPixels);

      updatedTexture.bufferUrls = {
        ...updatedTexture.bufferUrls,
        [type]: objectUrl
      };

      const dataUrl = new Image({
        data: pixels,
        width: t.width,
        height: t.height
      }).toDataURL();

      updatedTexture.dataUrls = {
        ...updatedTexture.dataUrls,
        [type]: dataUrl
      };
    }

    nextTextureDefs.push(updatedTexture);
  });

  await Promise.all(texturePromises);

  return {
    textureDefs: nextTextureDefs
  };
}

export default async function loadTextureFile({
  buffer,
  textureDefs,
  fileName,
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

    const textureBufferData = await loadTextureBuffer(
      buffer,
      textureDefs,
      !expectOobReferences
    );

    const textureBufferUrl = await bufferToObjectUrl(buffer);

    result = {
      textureBufferUrl: textureBufferUrl,
      isLzssCompressed,
      fileName,
      textureFileType,
      ...textureBufferData
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

    const decompressedBuffer = decompressLzssBuffer(buffer);

    const textureBufferData = await loadTextureBuffer(
      decompressedBuffer,
      textureDefs,
      !expectOobReferences
    );

    result = {
      textureBufferUrl: await bufferToObjectUrl(decompressedBuffer),
      fileName,
      isLzssCompressed: true,
      textureFileType,
      ...textureBufferData
    };
  }

  return result;
}
