import exportTextureFile from '@/utils/textures/files/exportTextureFile';
import { showError } from '../errorMessages/errorMessagesSlice';
import { AppState, createAppAsyncThunk } from '../storeTypings';
import {
  AdjustTextureHslPayload,
  AdjustTextureHslResult,
  LoadPolygonsPayload,
  LoadTexturesPayload,
  LoadTexturesResultPayload
} from './modelDataTypes';
import { NLUITextureDef, TextureDataUrlType } from '@/types/NLAbstractions';
import { decompressLzssBuffer } from '@/utils/data';
import decompressVqBuffer from '@/utils/data/decompressVqBuffer';
import textureShapesMap from '@/utils/textures/files/textureShapesMap';
import { HslValues } from '@/utils/textures';
import { ClientThread } from '@/utils/threads';
import { WorkerEvent } from '@/workers/worker';
import {
  selectHasCompressedTextures,
  selectTextureFileType,
  selectUpdatedTextureDefs
} from '../selectors';
import textureFileTypeMap from '@/utils/textures/files/textureFileTypeMap';
import { LoadTextureFileWorkerResult } from '@/workers/loadTextureFileWorker';
import globalBuffers from '@/utils/data/globalBuffers';
import { LoadPolygonFileWorkerResult } from '@/workers/loadPolygonFileWorker';

const imgTypes = ['opaque', 'translucent'] as TextureDataUrlType[];

export const sliceName = 'modelData';

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
    const jpLifebar = new Uint8Array(
      await decompressLzssBuffer(Buffer.from(compressedJpLifebarAssets))
    );
    let compressedUsLifebar: Uint8Array | undefined;
    let usLifebar: Uint8Array | undefined;

    const compressedVq1Image = uint8Array.slice(pointers[1], pointers[2]);
    const vq1Image = decompressVqBuffer(
      Buffer.from(decompressLzssBuffer(Buffer.from(compressedVq1Image))),
      256,
      256
    );

    const compressedVq2Image = uint8Array.slice(
      ...[pointers[2], ...(pointers[3] ? [pointers[3]] : [])]
    );

    const vq2Image = decompressVqBuffer(
      Buffer.from(decompressLzssBuffer(Buffer.from(compressedVq2Image))),
      128,
      128
    );

    if (pointers[3]) {
      compressedUsLifebar = uint8Array.slice(pointers[3]);
      usLifebar = new Uint8Array(
        await decompressLzssBuffer(Buffer.from(compressedUsLifebar))
      );
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

    const sharedBuffer = new SharedArrayBuffer(decompressedBuffer.byteLength);
    const targetBuffer = new Uint8Array(sharedBuffer);
    targetBuffer.set(new Uint8Array(decompressedBuffer));

    const textureFileType = 'mvc2-character-portraits';
    const textureDefs = textureShapesMap[textureFileType]
      .slice(0, pointers.length)
      .map((d, i) => ({ ...d, baseLocation: decompressedOffsets[i] }));

    await dispatch(
      loadTextureFile({
        file,
        textureFileType,
        textureDefs,
        textureBuffer: sharedBuffer,
        isLzssCompressed: false
      })
    );
  }
);

function cleanupTextureBuffers(state: AppState) {
  const { modelData } = state;
  const textureDefKeys: string[] = modelData.textureDefs
    .flatMap((d) => [d.bufferKeys.opaque, d.bufferKeys.translucent])
    .filter(Boolean);

  const textureHistoryKeys: string[] = Object.values(modelData.textureHistory)
    .flatMap((textureSet) =>
      textureSet.flatMap((t) => [t.bufferKeys.opaque, t.bufferKeys.translucent])
    )
    .filter(Boolean) as string[];
  const replacedTextureKeys = state.replaceTexture.replacementImage?.bufferKey
    ? [state.replaceTexture.replacementImage.bufferKey]
    : [];

  const editedTextureKeys: string[] = Object.values(modelData.editedTextures)
    .flatMap((t) => [t.bufferKeys?.opaque, t.bufferKeys?.translucent])
    .filter(Boolean) as string[];

  [
    ...textureDefKeys,
    ...textureHistoryKeys,
    ...replacedTextureKeys,
    ...editedTextureKeys
  ].forEach((key) => {
    globalBuffers.delete(key);
  });
}

export const loadPolygonFile = createAppAsyncThunk(
  `${sliceName}/loadPolygonFile`,
  async (file: File, { dispatch }) => {
    globalBuffers.clear();
    await dispatch(processPolygonFile(file));
  }
);

export const processPolygonFile = createAppAsyncThunk(
  `${sliceName}/processPolygonFile`,
  async (file: File): Promise<LoadPolygonsPayload> => {
    const fBuffer = await file.arrayBuffer();
    const sharedBuffer = new SharedArrayBuffer(fBuffer.byteLength);
    const buffer = new Uint8Array(sharedBuffer);
    buffer.set(new Uint8Array(fBuffer));
    const thread = new ClientThread();

    const result = await new Promise<LoadPolygonsPayload>((resolve) => {
      thread.onmessage = (
        event: MessageEvent<{ result: LoadPolygonFileWorkerResult }>
      ) => {
        const { polygonBuffer, ...result } = event.data.result;

        resolve({
          ...result,
          polygonBufferKey: globalBuffers.add(polygonBuffer)
        });

        thread.unallocate();
      };

      thread.postMessage({
        type: 'loadPolygonFile',
        payload: { buffer: sharedBuffer, fileName: file.name }
      } as WorkerEvent);
    });

    return result;
  }
);

/** called from UI to clean up and then process texture file */
export const loadTextureFile = createAppAsyncThunk(
  `${sliceName}/loadTextureFile`,
  async (payload: LoadTexturesPayload, { getState, dispatch }) => {
    const state = getState();

    // cleanup buffer if no polygon needed
    const prevPolygonBufferKey = state.modelData.polygonBufferKey;
    const prevTextureBufferKey = state.modelData.textureBufferKey;

    // cleanup texture related buffer
    setTimeout(() => {
      dispatch(processTextureFile(payload));
      if (prevTextureBufferKey) {
        globalBuffers.delete(prevTextureBufferKey);
      }

      if (
        prevPolygonBufferKey &&
        !textureFileTypeMap[payload.textureFileType].polygonMapped
      ) {
        globalBuffers.delete(prevPolygonBufferKey);
      }

      cleanupTextureBuffers(state);
    }, 250);
  }
);

/** handled in reducer */
export const processTextureFile = createAppAsyncThunk(
  `${sliceName}/processTextureFile`,
  async (
    {
      file,
      textureFileType,
      isLzssCompressed = false,
      textureBuffer,
      textureDefs: providedTextureDefs
    }: LoadTexturesPayload,
    { getState, dispatch }
  ) => {
    const state = getState();

    let updatedTextureDefs: NLUITextureDef[];

    if (!textureFileTypeMap[textureFileType].polygonMapped) {
      updatedTextureDefs =
        providedTextureDefs || textureShapesMap[textureFileType];

      // clear polygons if texture headers aren't from poly file
      dispatch({
        type: processPolygonFile.fulfilled.type,
        payload: {
          models: [],
          fileName: undefined,
          polygonBufferKey: undefined,
          textureDefs: updatedTextureDefs
        }
      });
    } else {
      updatedTextureDefs = state.modelData.textureDefs;
    }

    let buffer: Uint8Array = new Uint8Array(
      textureBuffer instanceof SharedArrayBuffer
        ? new Uint8Array(textureBuffer)
        : new Uint8Array(await file.arrayBuffer())
    );

    if (
      isLzssCompressed ||
      state.modelData.resourceAttribs?.hasLzssTextureFile
    ) {
      const fBuffer = await file.arrayBuffer();
      const sharedBuffer = new SharedArrayBuffer(fBuffer.byteLength);
      const arrayBuffer = new Uint8Array(sharedBuffer);
      arrayBuffer.set(new Uint8Array(fBuffer));
      buffer = Buffer.from(new Uint8Array(decompressLzssBuffer(sharedBuffer)));
    }

    const thread = new ClientThread();

    const result = await new Promise<LoadTexturesResultPayload>((resolve) => {
      thread.onmessage = (
        event: MessageEvent<{ result: LoadTextureFileWorkerResult }>
      ) => {
        const {
          texturePixelBuffers,
          decompressedTextureBuffer,
          textureDefs: returnedTextureDefs
        } = event.data.result;

        returnedTextureDefs.forEach((_t, i) => {
          imgTypes.forEach((imgType) => {
            const pixelBuffer =
              texturePixelBuffers[imgType === 'opaque' ? i * 2 : i * 2 + 1];

            // serialize buffers before returning result to state
            const bufferKey = globalBuffers.add(pixelBuffer);
            returnedTextureDefs[i].bufferKeys = {
              ...(returnedTextureDefs[i]?.bufferKeys ?? {}),
              [imgType]: bufferKey
            };
          });
        });

        const bufferKey = globalBuffers.add(decompressedTextureBuffer);

        resolve({
          fileName: file.name,
          textureBufferKey: bufferKey,
          isLzssCompressed,
          textureFileType,
          textureDefs: returnedTextureDefs
        });

        thread.unallocate();
      };

      const sharedBuffer = new SharedArrayBuffer(buffer.byteLength);
      const arrayBuffer = new Uint8Array(sharedBuffer);
      arrayBuffer.set(new Uint8Array(buffer));
      thread.postMessage({
        type: 'loadTextureFile',
        payload: {
          fileName: file.name,
          textureDefs: updatedTextureDefs,
          textureFileBuffer: sharedBuffer,
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
    payload: { textureIndex: number; hsl: HslValues },
    { getState, dispatch }
  ) => {
    const state = getState();

    const prevEditedTexture =
      state.modelData.editedTextures[payload.textureIndex];

    // abort processing in reducer if no hsl change & edited
    const { hsl } = payload;
    if (prevEditedTexture) {
      const prevHsl = prevEditedTexture?.hsl;
      if (
        prevHsl?.h === hsl.h &&
        prevHsl?.s === hsl.s &&
        prevHsl?.l === hsl.l
      ) {
        return;
      }
    }

    // if no concrete changes and first edit, abort
    if (!prevEditedTexture && hsl.h === 0 && hsl.l === 0 && hsl.s === 0) {
      return;
    }

    setTimeout(() => {
      if (prevEditedTexture?.bufferKeys.opaque) {
        globalBuffers.delete(prevEditedTexture.bufferKeys.opaque);
      }

      if (prevEditedTexture?.bufferKeys.translucent) {
        globalBuffers.delete(prevEditedTexture.bufferKeys.translucent);
      }
    }, 250);

    await dispatch(processAdjustedTextureHsl(payload));
  }
);

export const processAdjustedTextureHsl = createAppAsyncThunk(
  `${sliceName}/processAdjustedTextureHsl`,
  async (
    { textureIndex, hsl }: { textureIndex: number; hsl: HslValues },
    { getState }
  ) => {
    const state = getState();
    const textureDef = state.modelData.textureDefs[textureIndex];
    const { bufferKeys } = textureDef;

    const thread = new ClientThread();
    const buffers = {
      translucent: globalBuffers.getShared(bufferKeys.translucent),
      opaque: globalBuffers.getShared(bufferKeys.opaque)
    };

    const result = await new Promise<AdjustTextureHslPayload>((resolve) => {
      thread.onmessage = (event: MessageEvent<AdjustTextureHslResult>) => {
        const [opaqueRgbaBuffer, translucentRgbaBuffer] = event.data.result;
        const bufferKeys = {
          opaque: globalBuffers.add(opaqueRgbaBuffer),
          translucent: globalBuffers.add(translucentRgbaBuffer)
        };

        resolve({ bufferKeys, textureIndex, hsl });
        thread.unallocate();
      };

      thread.postMessage({
        type: 'adjustTextureHsl',
        payload: { hsl, textureIndex, buffers }
      } as WorkerEvent);
    });

    return result;
  }
);

export const downloadTextureFile = createAppAsyncThunk(
  `${sliceName}/downloadTextureFile`,
  async (_, { getState, dispatch }) => {
    const state = getState();
    const { textureFileName, textureBufferKey = '' } = state.modelData;
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
        textureBufferKey,
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
