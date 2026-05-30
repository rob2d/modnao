import quanti from 'quanti';
import type { NLUITextureDef, TextureFileType } from '@/types';
import processExportTexturePixels from '@/utils/textures/files/processExportTexturePixels';
import getQuantizeOptions from '@/utils/textures/files/getQuantizationOptions';
import compressVqBuffer from '@/utils/data/compressVqBuffer';
import { getTextureDefDataLength } from '@/utils/textures';
import { VQ_TEXTURE_ENCODE_TYPE } from '@/utils/textures/VqFormatConstants';

export type ExportTextureDefRegionWorkerPayload = {
  textureDef: NLUITextureDef;
  textureFileType: TextureFileType;
  textureBuffer: SharedArrayBuffer;
  pixelColors: SharedArrayBuffer;
};

export default async function exportTextureDefRegionWorker({
  textureDef,
  textureFileType,
  textureBuffer,
  pixelColors
}: ExportTextureDefRegionWorkerPayload) {
  const pixelColorsBuffer = new Uint8Array(pixelColors);
  const { baseLocation, ramOffset, width, height, colorFormat, flipX } =
    textureDef;
  const quantizeOptions = getQuantizeOptions(textureFileType, width);

  if (quantizeOptions) {
    const palette = quanti(pixelColorsBuffer, quantizeOptions.colors, 4);
    if (quantizeOptions.dithering) {
      palette.ditherProcess(pixelColorsBuffer, width);
    } else {
      palette.process(pixelColorsBuffer);
    }
  }

  if (textureDef.type === VQ_TEXTURE_ENCODE_TYPE) {
    const decompressedTextureBuffer = new SharedArrayBuffer(width * height * 2);

    processExportTexturePixels({
      pixelColors: pixelColorsBuffer,
      width,
      height,
      flipX,
      baseLocation: 0,
      ramOffset: 0,
      colorFormat,
      textureBuffer: decompressedTextureBuffer
    });

    const compressedTextureBuffer = compressVqBuffer(
      Buffer.from(new Uint8Array(decompressedTextureBuffer)),
      colorFormat
    );
    const expectedLength = getTextureDefDataLength(textureDef);

    if (compressedTextureBuffer.length !== expectedLength) {
      throw new Error('VQ texture export length mismatch');
    }

    const targetBuffer = new Uint8Array(textureBuffer);
    const writeLocation = baseLocation - ramOffset;

    if (writeLocation + compressedTextureBuffer.length > targetBuffer.length) {
      throw new RangeError('VQ texture export out of range');
    }

    targetBuffer.set(compressedTextureBuffer, writeLocation);
    return;
  }

  processExportTexturePixels({
    pixelColors: pixelColorsBuffer,
    width,
    height,
    flipX,
    baseLocation,
    ramOffset,
    colorFormat,
    textureBuffer
  });
}
