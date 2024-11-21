import decompressVqBuffer from '@/utils/data/decompressVqBuffer';
import textureShapesMap from '@/utils/textures/files/textureShapesMap';
import { decompressLzssBuffer } from '@/utils/data';
import { createAppAsyncThunk } from '../storeTypings';
import { loadTextureFile } from '../modelDataSlice';

const loadCharacterPortraitsFile = createAppAsyncThunk(
  `modelData/loadCharacterPortraitWsFile`,
  async (file: File, { dispatch }) => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const startPointer = buffer.readUint32LE(0);
    const pointers = [startPointer];

    for (let offset = 4; offset < startPointer; offset += 4) {
      pointers.push(buffer.readUInt32LE(offset));
    }

    const uint8Array = new Uint8Array(arrayBuffer);
    const compressedJpLifebarAssets = uint8Array.slice(
      pointers[0],
      pointers[1]
    );
    const jpLifebar = await decompressLzssBuffer(
      Buffer.from(compressedJpLifebarAssets)
    );
    let compressedUsLifebar: Uint8Array | undefined;
    let usLifebar: Uint8Array | undefined;

    const compressedVq1Image = uint8Array.slice(pointers[1], pointers[2]);
    const vq1Image = decompressVqBuffer(
      decompressLzssBuffer(Buffer.from(compressedVq1Image)),
      512,
      512
    );

    const compressedVq2Image = uint8Array.slice(
      ...[pointers[2], ...(pointers[3] ? [pointers[3]] : [])]
    );

    const vq2Image = decompressVqBuffer(
      decompressLzssBuffer(Buffer.from(compressedVq2Image)),
      128,
      128
    );

    if (pointers[3]) {
      compressedUsLifebar = uint8Array.slice(pointers[3]);
      usLifebar = await decompressLzssBuffer(Buffer.from(compressedUsLifebar));
    }

    const pointerBuffer = Buffer.alloc(startPointer);
    pointerBuffer.writeUInt32LE(startPointer, 0);
    pointerBuffer.writeUInt32LE(startPointer + jpLifebar.length, 4);
    pointerBuffer.writeUInt32LE(
      pointerBuffer.readUInt32LE(4) + vq1Image.length,
      8
    );

    if (pointers[3] !== undefined) {
      pointerBuffer.writeUInt32LE(
        pointerBuffer.readUInt32LE(8) + vq2Image.length,
        12
      );
    }

    let position = startPointer;
    const decompressedOffsets: number[] = [];
    decompressedOffsets.push(position);

    position += jpLifebar.length;
    decompressedOffsets.push(position);

    position += vq1Image.length;
    decompressedOffsets.push(position);

    if (pointers[3] !== undefined) {
      position += vq2Image.length;
      decompressedOffsets.push(position);
    }

    // rewrite pointers to decompressed offsets

    pointerBuffer.writeUInt32LE(startPointer, 0);
    pointerBuffer.writeUInt32LE(startPointer + jpLifebar.length, 4);
    pointerBuffer.writeUInt32LE(
      startPointer + jpLifebar.length + vq1Image.length,
      8
    );

    if (usLifebar) {
      pointerBuffer.writeUInt32LE(
        pointerBuffer.readUInt32LE(8) + vq2Image.length,
        12
      );
    }

    const trailingSection = new Uint8Array(buffer).slice(
      compressedUsLifebar
        ? pointers[3] + compressedUsLifebar.length
        : pointers[2] + compressedVq2Image.length
    );

    const tSectionPointer = usLifebar
      ? pointerBuffer.readUint32LE(12) + usLifebar.length
      : pointerBuffer.readUint32LE(8) + vq2Image.length;

    const tSectionBytes = Buffer.from(new Uint8Array(4));
    tSectionBytes.writeUInt32LE(tSectionPointer, 0);

    const decompressedBuffer = Buffer.concat([
      pointerBuffer,
      jpLifebar,
      vq1Image,
      vq2Image,
      ...(usLifebar ? [usLifebar] : []),
      trailingSection,
      tSectionBytes
    ]);

    const textureFileType = 'mvc2-character-portraits';
    const textureDefs = textureShapesMap[textureFileType]
      .slice(0, pointers.length)
      .map((d, i) => ({ ...d, baseLocation: decompressedOffsets[i] }));

    dispatch(
      loadTextureFile({
        file,
        textureFileType,
        providedTextureDefs: textureDefs,
        providedBuffer: decompressedBuffer
      })
    );
    return File;
  }
);

export default loadCharacterPortraitsFile;
