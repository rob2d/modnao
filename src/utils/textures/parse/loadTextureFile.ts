import { NLTextureDef } from '@/types/NLAbstractions';
import processTextureBuffer from './processTextureBuffer';
import { decompressTextureBuffer } from '@/utils/textures/parse';
import { SourceTextureData } from '../SourceTextureData';

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
    sourceTextureData: SourceTextureData[];
  };

  try {
    const textureBufferData = await processTextureBuffer(buffer, textureDefs);

    result = {
      hasCompressedTextures: false,
      fileName,
      buffer,
      ...textureBufferData
    };
  } catch (error) {
    // if an overflow error occurs, this is an indicator that the
    // file loaded is compressed; this is common for certain
    // game texture formats like Capcom vs SNK 2

    if (!(error instanceof RangeError)) {
      throw error;
    }

    const decompressedBuffer = decompressTextureBuffer(buffer);

    const textureBufferData = await processTextureBuffer(
      decompressedBuffer,
      textureDefs
    );

    result = {
      fileName,
      hasCompressedTextures: true,
      buffer: decompressedBuffer,
      ...textureBufferData
    };
  }

  return result;
}
