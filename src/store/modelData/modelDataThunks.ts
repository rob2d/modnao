import exportTextureFile from '@/utils/textures/files/exportTextureFile';
import { showError, sliceName } from '../errorMessagesSlice';
import { createAppAsyncThunk } from '../storeTypings';
import {
  AdjustTextureHslPayload,
  AdjustTextureHslResult,
  LoadPolygonsPayload,
  LoadPolygonsResult,
  LoadTexturesPayload,
  LoadTexturesResult
} from './modelDataTypes';
import { NLUITextureDef } from '@/types/NLAbstractions';
import { decompressLzssBuffer } from '@/utils/data';
import decompressVqBuffer from '@/utils/data/decompressVqBuffer';
import textureFileTypeMap, {
  TextureFileType
} from '@/utils/textures/files/textureFileTypeMap';
import textureShapesMap from '@/utils/textures/files/textureShapesMap';
import HslValues from '@/utils/textures/HslValues';
import { ClientThread } from '@/utils/threads';
import { WorkerEvent } from '@/workers/worker';
import {
  selectHasCompressedTextures,
  selectTextureFileType,
  selectUpdatedTextureDefs
} from '../selectors';

export const loadCharacterPortraitsFile = createAppAsyncThunk(
  `${sliceName}/loadCharacterPortraitWsFile`,
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
      256,
      256
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
  }
);

export const loadPolygonFile = createAppAsyncThunk(
  `${sliceName}/loadPolygonFile`,
  async (file: File, { getState }): Promise<LoadPolygonsPayload> => {
    const { modelData } = getState();
    const buffer = await file.arrayBuffer();
    const thread = new ClientThread();

    const result = await new Promise<LoadPolygonsPayload>((resolve) => {
      const prevPolygonBufferUrl = modelData.polygonBufferUrl;
      thread.onmessage = (event: MessageEvent<LoadPolygonsResult>) => {
        resolve(event.data.result);

        if (prevPolygonBufferUrl) {
          URL.revokeObjectURL(prevPolygonBufferUrl);
        }

        thread.unallocate();
      };

      thread.postMessage({
        type: 'loadPolygonFile',
        payload: { buffer, fileName: file.name }
      } as WorkerEvent);
    });

    return result;
  }
);

export const loadTextureFile = createAppAsyncThunk(
  `${sliceName}/loadTextureFile`,
  async (
    {
      file,
      textureFileType,
      providedBuffer,
      providedTextureDefs,
      isLzssCompressed
    }: {
      file: File;
      textureFileType: TextureFileType;
      isLzssCompressed?: boolean;
      providedBuffer?: Buffer;
      providedTextureDefs?: NLUITextureDef[];
    },
    { getState, dispatch }
  ) => {
    const state = getState();

    let textureDefs: NLUITextureDef[];

    if (!textureFileTypeMap[textureFileType].polygonMapped) {
      textureDefs = providedTextureDefs || textureShapesMap[textureFileType];
      // clear polygons if texture headers aren't from poly file
      dispatch({
        type: loadPolygonFile.fulfilled.type,
        payload: {
          models: [],
          fileName: undefined,
          polygonBufferUrl: undefined,
          textureDefs
        }
      });
    } else {
      textureDefs = state.modelData.textureDefs;
    }

    let buffer = providedBuffer || new Uint8Array(await file.arrayBuffer());

    if (
      isLzssCompressed ||
      state.modelData.resourceAttribs?.hasLzssTextureFile
    ) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = decompressLzssBuffer(Buffer.from(arrayBuffer));
    }

    const prevTextureBufferUrl = state.modelData.textureBufferUrl;
    const thread = new ClientThread();

    const result = await new Promise<LoadTexturesPayload>((resolve) => {
      thread.onmessage = (event: MessageEvent<LoadTexturesResult>) => {
        resolve(event.data.result);

        // deallocate existing blob
        if (prevTextureBufferUrl) {
          URL.revokeObjectURL(prevTextureBufferUrl);
        }

        thread.unallocate();
      };

      const fileName = file.name;

      thread.postMessage({
        type: 'loadTextureFile',
        payload: {
          fileName,
          textureDefs,
          buffer,
          isLzssCompressed,
          textureFileType
        }
      } as WorkerEvent);
    });

    return { ...result, textureFileType };
  }
);

export const adjustTextureHsl = createAppAsyncThunk(
  `${sliceName}/adjustTextureHsl`,
  async (
    { textureIndex, hsl }: { textureIndex: number; hsl: HslValues },
    { getState }
  ) => {
    const state = getState();
    const textureDef = state.modelData.textureDefs[textureIndex];
    const { width, height, bufferUrls: sourceTextureData } = textureDef;
    const thread = new ClientThread();

    const result = await new Promise<AdjustTextureHslPayload>((resolve) => {
      thread.onmessage = (event: MessageEvent<AdjustTextureHslResult>) => {
        resolve(event.data.result);
        thread.unallocate();
      };

      thread.postMessage({
        type: 'adjustTextureHsl',
        payload: {
          hsl,
          textureIndex,
          sourceTextureData,
          width,
          height
        }
      } as WorkerEvent);
    });

    return result;
  }
);

export const downloadTextureFile = createAppAsyncThunk(
  `${sliceName}/downloadTextureFile`,
  async (_, { getState, dispatch }) => {
    const state = getState();
    const { textureFileName, textureBufferUrl = '' } = state.modelData;
    const textureDefs = selectUpdatedTextureDefs(state);
    const textureFileType = selectTextureFileType(state);
    const isLzssCompressed = selectHasCompressedTextures(state);

    if (!textureFileType) {
      dispatch(
        showError({
          title: 'Invalid file selected',
          message: 'No valid texture filetype was loaded.'
        })
      );
      return;
    }

    try {
      await exportTextureFile({
        textureDefs,
        textureFileName,
        textureBufferUrl,
        textureFileType,
        isLzssCompressed
      });
    } catch (error: unknown) {
      console.error(error);
      let message = '';

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else {
        error = 'Unknown error occurred';
      }

      const errorAction = showError({
        title: 'Error exporting texture',
        message
      });

      dispatch(errorAction);
    }
  }
);
