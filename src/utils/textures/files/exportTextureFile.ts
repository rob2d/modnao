import quanti from 'quanti';
import { NLUITextureDef } from '@/types/NLAbstractions';
import { compressLzssBuffer } from '@/utils/data';
import { TextureFileType } from './textureFileTypeMap';
import compressVqBuffer from '@/utils/data/compressVqBuffer';
import { saveAs } from 'file-saver';
import globalBuffers from '@/utils/data/globalBuffers';
import processPixelColors from './processPixelColors';
import { padBufferForAlignment } from '@/utils/data/padBufferForAlignment';

type QuantizeOptions = {
  colors: number;
  dithering: boolean;
};

type ExportTextureParams = {
  textureDefs: NLUITextureDef[];
  textureFileName?: string;
  textureFileType: TextureFileType;
  textureBufferKey: string;
  isLzssCompressed: boolean;
};

export default async function exportTextureFile({
  textureDefs,
  textureFileName = '',
  textureFileType,
  textureBufferKey,
  isLzssCompressed
}: ExportTextureParams): Promise<void> {
  const textureBuffer = Buffer.from(globalBuffers.get(textureBufferKey));

  for await (const t of textureDefs) {
    const { baseLocation, ramOffset, width, height } = t;

    const pixelColors = globalBuffers.get(t.bufferKeys.translucent as string);
    let quantizeOptions: QuantizeOptions | undefined;

    switch (textureFileType) {
      case 'mvc2-character-portraits': {
        quantizeOptions = {
          dithering: false,
          // restrict colors further on smaller lifegauge imgs
          colors: width === 64 ? 44 : 112
        };
        break;
      }
      case 'cvs2-console-menu':
        quantizeOptions = {
          dithering: false,
          colors: 512
        };
        break;
      case 'mvc2-selection-textures': {
        quantizeOptions = {
          dithering: false,
          colors: 504
        };
        break;
      }
      case 'mvc2-special-effects':
      case 'mvc2-end-file':
      case 'vs2-stage-file':
      case 'vs2-demo-model': {
        break;
      }
      default:
        break;
    }

    if (quantizeOptions) {
      const palette = quanti(pixelColors, quantizeOptions.colors, 4);
      if (quantizeOptions.dithering) {
        palette.ditherProcess(pixelColors, width);
      } else {
        palette.process(pixelColors);
      }
    }

    processPixelColors(
      pixelColors,
      width,
      height,
      baseLocation,
      ramOffset,
      t.colorFormat,
      textureBuffer
    );
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

      for (let offset = 4; offset < startPointer; offset += 4) {
        pointers.push(buffer.readUInt32LE(offset));
      }

      const uint8Array = new Uint8Array(buffer);
      const jpSection = Buffer.from(uint8Array.slice(pointers[0], pointers[1]));
      const compressedJpSection = padBufferForAlignment(
        startPointer,
        compressLzssBuffer(jpSection)
      );

      const vq1Section = Buffer.from(
        uint8Array.slice(pointers[1], pointers[2])
      );

      const compressedVq1Section = compressLzssBuffer(
        compressVqBuffer(vq1Section)
      );

      const tSectionPointer = Buffer.from(uint8Array).readUInt32LE(
        uint8Array.length - 4
      );

      const vq2Section = Buffer.from(
        uint8Array.slice(
          ...[pointers[2], ...(pointers[3] ? [pointers[3]] : [tSectionPointer])]
        )
      );

      const compressedVq2Section = padBufferForAlignment(
        startPointer,
        compressLzssBuffer(compressVqBuffer(vq2Section)),
        startPointer + compressedJpSection.length + compressedVq1Section.length
      );

      buffer.writeUInt32LE(startPointer, 0);
      buffer.writeUInt32LE(startPointer + compressedJpSection.length, 4);
      buffer.writeUInt32LE(
        startPointer + compressedJpSection.length + compressedVq1Section.length,
        8
      );

      let usSection;
      let compressedUsSection;

      if (pointers[3]) {
        usSection = Buffer.from(new Uint8Array(buffer).slice(pointers[3]));
        compressedUsSection = padBufferForAlignment(
          startPointer,
          compressLzssBuffer(usSection)
        );

        // us section, 12
        buffer.writeUInt32LE(
          startPointer +
            compressedJpSection.length +
            compressedVq1Section.length +
            compressedVq2Section.length,
          12
        );
      }

      const trailingSection = new Uint8Array(buffer).slice(
        tSectionPointer,
        buffer.length - 4
      );

      const outputBuffer = Buffer.concat([
        new Uint8Array(buffer).slice(0, startPointer),
        compressedJpSection,
        compressedVq1Section,
        compressedVq2Section,
        ...(compressedUsSection ? [compressedUsSection] : []),
        trailingSection
      ]);

      output = new Blob([outputBuffer], { type: 'application/octet-stream' });
      break;
    }
    default: {
      const outputBuffer = !isLzssCompressed
        ? textureBuffer
        : compressLzssBuffer(textureBuffer);

      output = new Blob([outputBuffer], { type: 'application/octet-stream' });
      break;
    }
  }

  const name = textureFileName.substring(0, textureFileName.lastIndexOf('.'));
  const extension = textureFileName.substring(
    textureFileName.lastIndexOf('.') + 1
  );
  saveAs(output, `${name}.mn.${extension}`);
}
