import { NLTextureDef } from '@/types/NLAbstractions';
import processTextureBuffer from './processTextureBuffer';
import { decompressTextureBuffer } from '@/utils/textures/parse';

export default async function loadTextureFile({
  buffer,
  textureDefs,
  fileName
}: {
  textureDefs: NLTextureDef[];
  fileName: string;
  buffer: Buffer;
}) {
  let result: {
    textureDefs: NLTextureDef[];
    fileName: string;
    hasCompressedTextures: boolean;
    buffer: Buffer;
    sourceTextureData: { translucent: ImageData; opaque: ImageData }[];
  };

  try {
    const { textureDefs: nextTextureDefs, sourceTextureData } =
      await processTextureBuffer(buffer, textureDefs);

    result = {
      textureDefs: nextTextureDefs,
      hasCompressedTextures: false,
      fileName,
      buffer,
      sourceTextureData
    };
  } catch (error) {
    // if an overflow error occurs, this is an indicator that the
    // file loaded is compressed; this is common for certain
    // game texture formats like Capcom vs SNK 2

    if (!(error instanceof RangeError)) {
      throw error;
    }

    const decompressedBuffer = decompressTextureBuffer(buffer);

    const { textureDefs: nextTextureDefs, sourceTextureData } =
      await processTextureBuffer(decompressedBuffer, textureDefs);

    result = {
      textureDefs: nextTextureDefs,
      fileName,
      hasCompressedTextures: true,
      buffer: decompressedBuffer,
      sourceTextureData
    };
  }

  return result;
}
