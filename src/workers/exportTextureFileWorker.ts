import sharedBufferFrom from '@/utils/data/sharedBufferFrom';
import compressLzssBuffer from '@/utils/data/compressLzssBuffer';
import compressVqBuffer from '@/utils/data/compressVqBuffer';
import padBufferForAlignment from '@/utils/data/padBufferForAlignment';
import { TextureFileType } from '@/utils/textures/files/textureFileTypeMap';

export interface ExportTextureFileWorkerPayload {
  textureFileType: TextureFileType;
  textureBuffer: SharedArrayBuffer;
  isLzssCompressed: boolean;
}

export type ExportTextureFileWorkerResult = SharedArrayBuffer;

export default async function exportTextureFileWorker({
  textureFileType,
  textureBuffer,
  isLzssCompressed
}: ExportTextureFileWorkerPayload): Promise<ExportTextureFileWorkerResult> {
  const readSection = (buffer: Uint8Array, ...startAndEnd: number[]) =>
    Buffer.from(new Uint8Array(buffer).slice(...startAndEnd));

  const compressLzssSection = (
    section: Buffer,
    startPointer: number,
    offset?: number
  ) => padBufferForAlignment(startPointer, compressLzssBuffer(section), offset);

  const textureBufferView = Buffer.from(new Uint8Array(textureBuffer));

  switch (textureFileType) {
    // character portraits are an interesting niche case
    // where compression exists but not applied to the entire file;
    // the file is also split into 3 (or 4 separate) sections
    // depending on if a character has international name variant
    case 'mvc2-character-portraits': {
      const buffer = Buffer.alloc(textureBufferView.length);
      textureBufferView.copy(buffer);

      const startPointer = buffer.readUint32LE(0);
      const pointers = [startPointer];

      for (let offset = 4; offset < startPointer; offset += 4) {
        pointers.push(buffer.readUInt32LE(offset));
      }

      const uint8Array = new Uint8Array(buffer);
      const jpSection = readSection(uint8Array, pointers[0], pointers[1]);
      const compressedJpSection = compressLzssSection(jpSection, startPointer);

      const vq1Section = readSection(uint8Array, pointers[1], pointers[2]);
      const compressedVq1Section = compressLzssBuffer(
        compressVqBuffer(vq1Section)
      );

      const tSectionPointer = Buffer.from(uint8Array).readUInt32LE(
        uint8Array.length - 4
      );

      const vq2SectionStart = pointers[2];
      const vq2SectionEnd = pointers[3] || tSectionPointer;

      const vq2Section = readSection(
        uint8Array,
        vq2SectionStart,
        vq2SectionEnd
      );

      const compressedVq2Section = compressLzssSection(
        compressVqBuffer(vq2Section),
        startPointer,
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
        usSection = readSection(uint8Array, pointers[3]);
        compressedUsSection = compressLzssSection(usSection, startPointer);

        // us section, 12
        buffer.writeUInt32LE(
          startPointer +
            compressedJpSection.length +
            compressedVq1Section.length +
            compressedVq2Section.length,
          12
        );
      }

      const trailingSection = readSection(
        buffer,
        tSectionPointer,
        buffer.length - 4
      );

      const outputBuffer = Buffer.concat([
        readSection(buffer, 0, startPointer),
        compressedJpSection,
        compressedVq1Section,
        compressedVq2Section,
        ...(compressedUsSection ? [compressedUsSection] : []),
        trailingSection
      ]);

      return sharedBufferFrom(outputBuffer);
    }
    default: {
      const outputBuffer = !isLzssCompressed
        ? new Uint8Array(textureBuffer)
        : compressLzssBuffer(textureBufferView);

      return sharedBufferFrom(outputBuffer);
    }
  }
}
