import { NLUITextureDef, TextureDataUrlType } from '@/types/NLAbstractions';
import { decompressLzssBuffer, sharedBufferFrom } from '@/utils/data';
import decompressVqBuffer from '@/utils/data/decompressVqBuffer';
import {
  HslValues,
  textureFileTypeMap,
  textureShapesMap
} from '@/utils/textures';
import { ClientThread } from '@/utils/threads';
import globalBuffers from '@/utils/data/globalBuffers';
import {
  LoadTextureFileWorkerPayload,
  LoadTextureFileWorkerResult
} from '@/workers/loadTextureFileWorker';
import {
  LoadPolygonFileWorkerPayload,
  LoadPolygonFileWorkerResult
} from '@/workers/loadPolygonFileWorker';
import {
  AdjustTextureHslWorkerPayload,
  AdjustTextureHslWorkerResult
} from '@/workers/adjustTextureHslWorker';
import {
  selectHasCompressedTextures,
  selectTextureFileType,
  selectUpdatedTextureDefs
} from '../selectors';
import { showError } from '../errorMessages/errorMessagesSlice';
import { createAppAsyncThunk } from '../storeTypings';
import {
  LoadPolygonsPayload,
  LoadTexturesPayload,
  LoadTexturesResultPayload
} from './modelDataTypes';
import saveAs from 'file-saver';
import {
  ExportTextureFileWorkerPayload,
  ExportTextureFileWorkerResult
} from '@/workers/exportTextureFileWorker';
import { ExportTextureDefRegionWorkerPayload } from '@/workers/exportTextureDefRegionWorker';

const imgTypes = ['opaque', 'translucent'] as TextureDataUrlType[];

export const sliceName = 'modelData';

const decompressLzssSection = (
  section: Buffer | Buffer<ArrayBuffer>,
  startPointer: number,
  endPointer?: number
) => {
  const compressedBufferSection = new Uint8Array(section).slice(
    startPointer,
    endPointer
  );
  return [
    Buffer.from(decompressLzssBuffer(Buffer.from(compressedBufferSection))),
    compressedBufferSection
  ] as const;
};

// @TODO modularize image section definitions for declarative loading
export const loadCharacterPortraitsFile = createAppAsyncThunk(
  `${sliceName}/loadCharacterPortraitWsFile`,
  async (file: File, { dispatch }) => {
    const PTR_SIZE = 4;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ogPointers = [buffer.readUInt32LE(0)];
    for (let i = 1; i < ogPointers[0] / PTR_SIZE; i++) {
      ogPointers.push(buffer.readUInt32LE(i * PTR_SIZE));
    }

    const sections: Buffer<ArrayBufferLike>[] = [];

    const [jpLifebar] = decompressLzssSection(
      buffer,
      ogPointers[0],
      ogPointers[1]
    );
    sections.push(jpLifebar);

    const [vq1Lzss] = decompressLzssSection(
      buffer,
      ogPointers[1],
      ogPointers[2]
    );
    const vq1Image = decompressVqBuffer(vq1Lzss, 256, 256);
    sections.push(vq1Image);

    const [vq2Lzss, compressedVq2Buffer] = decompressLzssSection(
      buffer,
      ogPointers[2],
      ogPointers?.[3]
    );
    const vq2Image = decompressVqBuffer(vq2Lzss, 128, 128);
    sections.push(vq2Image);

    const [usLifebar, compressedUsLifebar] =
      ogPointers.length <= 3
        ? [undefined, undefined]
        : decompressLzssSection(buffer, ogPointers[3]);

    if (usLifebar) {
      sections.push(Buffer.from(usLifebar));
    }

    let position = ogPointers[0];

    const pointerBuffer = Buffer.alloc(ogPointers[0]);
    for (let i = 0; i < sections.length; i++) {
      pointerBuffer.writeUint32LE(position, PTR_SIZE * i);
      position += sections[i].length;
    }

    const trailingSection = new Uint8Array(buffer).slice(
      ogPointers[ogPointers.length - 1] +
        (compressedUsLifebar ?? compressedVq2Buffer).length
    );

    const finalSectionPointer =
      pointerBuffer.readUint32LE(PTR_SIZE * (sections.length - 1)) +
      sections[sections.length - 1].length;

    const fsPointerBuffer = Buffer.alloc(4);
    fsPointerBuffer.writeUint32LE(finalSectionPointer, 0);

    const decompressedBuffer = Buffer.concat([
      pointerBuffer,
      ...sections,
      trailingSection,
      fsPointerBuffer
    ]);

    const sharedBuffer = sharedBufferFrom(decompressedBuffer);

    const textureFileType = 'mvc2-character-portraits';
    const textureDefs = textureShapesMap[textureFileType]
      .slice(0, ogPointers.length)
      .map((d, i) => ({
        ...d,
        baseLocation: pointerBuffer.readUint32LE(i * PTR_SIZE)
      }));

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
    const buffer = sharedBufferFrom(Buffer.from(fBuffer));
    const { polygonBuffer, ...result } = await ClientThread.run<
      LoadPolygonFileWorkerPayload,
      LoadPolygonFileWorkerResult
    >('loadPolygonFile', { buffer, fileName: file.name });

    return {
      ...result,
      polygonBufferKey: globalBuffers.add(polygonBuffer)
    };
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

    // cleanup texture related buffers
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

      const { modelData } = state;
      const textureDefKeys: string[] = modelData.textureDefs
        .flatMap((d) => [d.bufferKeys.opaque, d.bufferKeys.translucent])
        .filter(Boolean);

      const textureHistoryKeys: string[] = Object.values(
        modelData.textureHistory
      )
        .flatMap((textureSet) =>
          textureSet.flatMap((t) => [
            t.bufferKeys.opaque,
            t.bufferKeys.translucent
          ])
        )
        .filter(Boolean) as string[];
      const replacedTextureKeys = state.replaceTexture.replacementImage
        ?.bufferKey
        ? [state.replaceTexture.replacementImage.bufferKey]
        : [];

      const editedTextureKeys: string[] = Object.values(
        modelData.editedTextures
      )
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
  ): Promise<LoadTexturesResultPayload> => {
    const state = getState();

    let textureDefs: NLUITextureDef[];

    if (!textureFileTypeMap[textureFileType].polygonMapped) {
      textureDefs = providedTextureDefs || textureShapesMap[textureFileType];

      // clear polygons if texture headers aren't from poly file
      dispatch({
        type: processPolygonFile.fulfilled.type,
        payload: {
          models: [],
          fileName: undefined,
          polygonBufferKey: undefined,
          textureDefs: textureDefs
        }
      });
    } else {
      textureDefs = state.modelData.textureDefs;
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
      const sharedBuffer = sharedBufferFrom(fBuffer);
      buffer = Buffer.from(new Uint8Array(decompressLzssBuffer(sharedBuffer)));
    }
    const textureFileBuffer = sharedBufferFrom(buffer);

    const threadResult = await ClientThread.run<
      LoadTextureFileWorkerPayload,
      LoadTextureFileWorkerResult
    >('loadTextureFile', {
      fileName: file.name,
      textureDefs,
      textureFileBuffer,
      isLzssCompressed,
      textureFileType
    });

    const updatedTextureDefs = structuredClone(textureDefs);

    updatedTextureDefs.forEach((_t, i) => {
      imgTypes.forEach((imgType) => {
        const pixelBuffer =
          threadResult.texturePixelBuffers[
            imgType === 'opaque' ? i * 2 : i * 2 + 1
          ];

        // serialize buffers before returning result to state
        const bufferKey = globalBuffers.add(pixelBuffer);
        updatedTextureDefs[i].bufferKeys = {
          ...(updatedTextureDefs[i]?.bufferKeys ?? {}),
          [imgType]: bufferKey
        };
      });
    });

    const textureBufferKey = globalBuffers.add(
      threadResult.decompressedTextureBuffer
    );

    return {
      textureBufferKey,
      textureDefs: updatedTextureDefs,
      textureFileType,
      fileName: file.name,
      isLzssCompressed
    };
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

    const [opaqueRgbaBuffer, translucentRgbaBuffer] = await Promise.all(
      [bufferKeys.opaque, bufferKeys.translucent].map((bufferKey) =>
        ClientThread.run<
          AdjustTextureHslWorkerPayload,
          AdjustTextureHslWorkerResult
        >('adjustTextureHsl', {
          hsl,
          buffer: globalBuffers.getShared(bufferKey)
        })
      )
    );

    return {
      bufferKeys: {
        opaque: globalBuffers.add(opaqueRgbaBuffer),
        translucent: globalBuffers.add(translucentRgbaBuffer)
      },
      textureIndex,
      hsl
    };
  }
);

export const downloadTextureFile = createAppAsyncThunk(
  `${sliceName}/downloadTextureFile`,
  async (_, { getState, dispatch }) => {
    const state = getState();
    const { textureFileName = '', textureBufferKey = '' } = state.modelData;
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
      const textureBuffer = globalBuffers.getShared(textureBufferKey);
      await Promise.all(
        textureDefs.map((textureDef) =>
          ClientThread.run<ExportTextureDefRegionWorkerPayload, void>(
            'exportTextureDefRegion',
            {
              textureDef,
              textureFileType,
              textureBuffer,
              pixelColors: globalBuffers.getShared(
                textureDef.bufferKeys.translucent
              )
            }
          )
        )
      );

      const outputBuffer = await ClientThread.run<
        ExportTextureFileWorkerPayload,
        ExportTextureFileWorkerResult
      >('exportTextureFile', {
        textureFileType,
        isLzssCompressed,
        textureBuffer
      });

      const arrayBuffer =
        outputBuffer instanceof SharedArrayBuffer
          ? (() => {
              const copy = new ArrayBuffer(outputBuffer.byteLength); // Allocate a new ArrayBuffer
              new Uint8Array(copy).set(new Uint8Array(outputBuffer)); // Copy data
              return copy;
            })()
          : outputBuffer;

      const fileOutput = new Blob([new Uint8Array(arrayBuffer)], {
        type: 'application/octet-stream'
      });
      const name = textureFileName.substring(
        0,
        textureFileName.lastIndexOf('.')
      );
      const extension = textureFileName.substring(
        textureFileName.lastIndexOf('.') + 1
      );

      saveAs(fileOutput, `${name}.mn.${extension}`);
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
