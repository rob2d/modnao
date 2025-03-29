import quanti from 'quanti';
import { NLUITextureDef } from '@/types/NLAbstractions';
import { TextureFileType } from '@/utils/textures/files/textureFileTypeMap';
import processExportTexturePixels from '@/utils/textures/files/processExportTexturePixels';
import getQuantizeOptions from '@/utils/textures/files/getQuantizationOptions';

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
  const { baseLocation, ramOffset, width, height, colorFormat } = textureDef;
  const quantizeOptions = getQuantizeOptions(textureFileType, width);

  if (quantizeOptions) {
    const palette = quanti(pixelColorsBuffer, quantizeOptions.colors, 4);
    if (quantizeOptions.dithering) {
      palette.ditherProcess(pixelColorsBuffer, width);
    } else {
      palette.process(pixelColorsBuffer);
    }
  }

  processExportTexturePixels({
    pixelColors: pixelColorsBuffer,
    width,
    height,
    baseLocation,
    ramOffset,
    colorFormat,
    textureBuffer
  });
}
