import { NLTextureDef } from '@/types/NLAbstractions';
import processTextureBuffer from './processTextureBuffer';
import { decompressTextureBuffer } from '@/utils/textures/parse';

export default async function loadTextureFile({
  buffer,
  models,
  textureDefs,
  fileName
}: {
  models: NLModel[];
  textureDefs: NLTextureDef[];
  fileName: string;
  buffer: Buffer;
}) {
  let result: {
    models: NLModel[];
    textureDefs: NLTextureDef[];
    fileName: string;
    hasCompressedTextures: boolean;
    buffer: Buffer;
  };
  try {
    result = {
      ...(await processTextureBuffer(buffer, models, textureDefs)),
      fileName,
      hasCompressedTextures: false,
      buffer
    };
  } catch (error) {
    // if an overflow error occurs, this is an indicator that the
    // file loaded is compressed; this is common for certain
    // game texture formats like Capcom vs SNK 2

    if (!(error instanceof RangeError)) {
      throw error;
    }

    const decompressedBuffer = decompressTextureBuffer(buffer);
    result = {
      ...(await processTextureBuffer(decompressedBuffer, models, textureDefs)),
      fileName,
      hasCompressedTextures: true,
      buffer: decompressedBuffer
    };
  }

  return result;
}
