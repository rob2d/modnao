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

function padBufferForAlignment(alignmentPointer: number, buffer: Buffer) {
  let b16Alignment = (buffer.length + alignmentPointer) % 16; 
  let alignmentPadding: number; 

  if(b16Alignment === alignmentPointer) {
    alignmentPadding = 0;
  } else if(b16Alignment > alignmentPointer) {
    alignmentPadding = 16 - b16Alignment + alignmentPointer;
  } else {
    alignmentPadding = alignmentPointer - b16Alignment;
  }

  return Buffer.concat([
    buffer,
    new Uint8Array(new Array(alignmentPadding).fill(0))
  ]);
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
    // where compression exists but not applied to the entire file;
    // the file is also split into 3 (or 4 separate) sections
    // depending on if a character has international name variant
    case 'mvc2-character-portraits': {
      const buffer = Buffer.alloc(textureBuffer.length);
      textureBuffer.copy(buffer);

      const startPointer = buffer.readUint32LE(0);
      const pointers = [startPointer];
    
      for(let offset = 4; offset < startPointer; offset+= 4) {
        pointers.push(buffer.readUInt32LE(offset));
      }

      const jpSection = Buffer.from(new Uint8Array(buffer).slice(pointers[0], pointers[1]));
      const compressedJpSection = padBufferForAlignment(startPointer, compressTextureBuffer(jpSection));

      
      buffer.writeUInt32LE(startPointer, 0);
      buffer.writeUInt32LE(startPointer + compressedJpSection.length, 4);
      buffer.writeUInt32LE(
        startPointer + compressedJpSection.length + (pointers[2] - pointers[1]),
        8
      );

      const uint8Array = new Uint8Array(buffer);
      
      const vqContent = uint8Array.slice(
        pointers[1], 
        pointers[3] !== undefined ? pointers[3] : undefined
      );
        
      let compressedUsSection = Buffer.alloc(0);
      if(pointers[3]) {
        const usSection = Buffer.from(new Uint8Array(buffer).slice(pointers[3]));
        compressedUsSection = padBufferForAlignment(startPointer, compressTextureBuffer(usSection));
        buffer.writeUInt32LE(startPointer + compressedJpSection.length + vqContent.length, 12);
      }

      const outputBuffer = Buffer.concat([
        uint8Array.slice(0, pointers[0]),
        compressedJpSection,
        vqContent,
        compressedUsSection
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
