import { NLTextureDef } from '@/types/NLAbstractions';
import decodeZMortonPosition from '@/utils/textures/serialize/decodeZMortonPosition';
import rgbaToRgb565 from '@/utils/color-conversions/rgbaToRgb565';
import rgbaToArgb1555 from '@/utils/color-conversions/rgbaToArgb1555';
import rgbaToArgb4444 from '@/utils/color-conversions/rgbaToArgb4444';
import { RgbaColor, TextureColorFormat } from '@/utils/textures';
import { compressTextureBuffer } from '@/utils/textures/parse';
import { objectUrlToBuffer } from '@/utils/data';
import { TextureFileType } from './textureFileTypeMap';
import CompressionVariant from '@/types/CompressionVariant';

const COLOR_SIZE = 2;

const conversionDict: Record<TextureColorFormat, (color: RgbaColor) => number> =
  {
    RGB565: rgbaToRgb565,
    ARGB1555: rgbaToArgb1555,
    ARGB4444: rgbaToArgb4444,
    RGB555: () => 0,
    ARGB8888: () => 0
  };

type ExportTextureOptions = { 
  textureDefs: NLTextureDef[];
  textureFileName?: string;
  textureFileType: TextureFileType; 
  textureBufferUrl: string;
  compressionVariant?: CompressionVariant;
};
export default async function exportTextureFile({
  textureDefs,
  textureFileName = '',
  textureFileType,
  textureBufferUrl,
  compressionVariant
}: ExportTextureOptions): Promise<void> {
  const textureBuffer = Buffer.from(await objectUrlToBuffer(textureBufferUrl));
  if (!textureBuffer) {
    return;
  }

  for await (const t of textureDefs) {
    const { baseLocation, ramOffset, width, height } = t;

    const pixelColors = new Uint8ClampedArray(
      await objectUrlToBuffer(t.bufferUrls.translucent as string)
    );

    for (let y = 0; y < height; y++) {
      const yOffset = width * y;
      for (let offset = yOffset; offset < yOffset + width; offset++) {
        const [positionX, positionY] = decodeZMortonPosition(offset);
        const positionOffset = positionY * width + positionX;
        const colorOffset = positionOffset * 4;
        const color = {
          r: pixelColors[colorOffset],
          g: pixelColors[colorOffset + 1],
          b: pixelColors[colorOffset + 2],
          a: pixelColors[colorOffset + 3]
        };

        const conversionOp = conversionDict[t.colorFormat];
        const offsetWritten = baseLocation - ramOffset + offset * COLOR_SIZE;

        // note: it is possible for textures to point out of bounds
        // of the file since it targets RAM in-game; hence the check
        if (offsetWritten + COLOR_SIZE < textureBuffer.length) {
          textureBuffer.writeUInt16LE(conversionOp(color), offsetWritten);
        }
      }
    }
  }

  let output: Blob;

  switch (textureFileType) {
    // character portraits are an interesting niche case
    // where compression exists but not applied to the entire file
    case 'mvc2-character-portraits': {
      const buffer = Buffer.alloc(textureBuffer.length);
      textureBuffer.copy(buffer);

      const pointers = [
        textureBuffer.readUInt32LE(0),
        textureBuffer.readUInt32LE(4),
        textureBuffer.readUInt32LE(8)
      ];

      const decompressedRleSection = new Uint8Array(buffer).slice(
        pointers[0],
        pointers[1]
      );

      const compressedRleTexture = compressTextureBuffer(
        Buffer.from(decompressedRleSection), 'double-zero-ending'
      );

      buffer.writeUInt32LE(12, 0);
      buffer.writeUInt32LE(12 + compressedRleTexture.length, 4);
      buffer.writeUInt32LE(
        12 + compressedRleTexture.length + (pointers[2] - pointers[1]),
        8
      );

      const uint8Array = new Uint8Array(buffer);
      const outputBuffer = Buffer.concat([
        uint8Array.slice(0, 12),
        compressedRleTexture,
        new Uint8Array(textureBuffer).slice(12 + decompressedRleSection.length)
      ]);

      output = new Blob([outputBuffer], {
        type: 'application/octet-stream'
      });
      break;
    }
    default: {
      const outputBuffer = !compressionVariant
        ? textureBuffer
        : compressTextureBuffer(textureBuffer, compressionVariant);

      output = new Blob([outputBuffer], {
        type: 'application/octet-stream'
      });
      break;
    }
  }

  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(output);

  const name = textureFileName.substring(0, textureFileName.lastIndexOf('.'));

  const extension = textureFileName.substring(
    textureFileName.lastIndexOf('.') + 1
  );
  link.download = `${name}.mn.${extension}`;
  link.click();
}
