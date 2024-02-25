import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { NLTextureDef } from '@/types/NLAbstractions';
import { WorkerEvent } from '@/worker';
import exportTextureFile from '../utils/textures/files/exportTextureFile';
import HslValues from '@/utils/textures/HslValues';
import {
  selectHasCompressedTextures,
  selectTextureFileType,
  selectUpdatedTextureDefs
} from './selectors';
import { SourceTextureData } from '@/utils/textures/SourceTextureData';
import { TextureFileType } from '@/utils/textures/files/textureFileTypeMap';
import { decompressLzssBuffer } from '@/utils/data';
import decompressVqBuffer from '@/utils/data/decompressVqBuffer';
import { ClientThread } from '@/utils/threads';
import { createAppAsyncThunk } from './typedFunctions';
import textureShapesMap from '@/utils/textures/files/textureShapesMap';
import { showError } from './errorMessagesSlice';

export type LoadPolygonsResult = {
  type: 'loadPolygonFile';
  result: LoadPolygonsPayload;
};

export type LoadTexturesResult = {
  type: 'loadTextureFile';
  result: LoadTexturesPayload;
};

export type AdjustTextureHslResult = {
  type: 'adjustTextureHsl';
  result: AdjustTextureHslPayload;
};

export type WorkerResponses =
  | LoadPolygonsResult
  | LoadTexturesResult
  | AdjustTextureHslResult;

export type EditedTexture = {
  width: number;
  height: number;
  bufferUrls: SourceTextureData;
  dataUrls: SourceTextureData;
  hsl: HslValues;
};

export type LoadTexturesPayload = {
  textureDefs: NLTextureDef[];
  fileName: string;
  textureBufferUrl: string;
  hasCompressedTextures: boolean;
  textureFileType: TextureFileType;
};

export type LoadPolygonsPayload =
  | {
      models: NLModel[];
      textureDefs: NLTextureDef[];
      fileName: string;
      polygonBufferUrl: string;
    }
  | {
      models: [];
      textureDefs: NLTextureDef[];
      fileName: undefined;
      polygonBufferUrl: undefined;
    };

export type AdjustTextureHslPayload = {
  textureIndex: number;
  bufferUrls: SourceTextureData;
  dataUrls: SourceTextureData;
  hsl: HslValues;
};

export interface ModelDataState {
  models: NLModel[];
  textureDefs: NLTextureDef[];
  /**
   * dictionary of texture index to previous buffer url stacks
   * note: should consider having only this stack and not deriving from
   * textureDefs to simplify state
   */
  textureHistory: {
    [key: number]: {
      dataUrls: SourceTextureData;
      bufferUrls: SourceTextureData;
    }[];
  };
  editedTextures: {
    [key: number]: EditedTexture;
  };
  polygonFileName?: string;
  textureFileName?: string;
  textureFileType?: TextureFileType;
  hasEditedTextures: boolean;
  hasCompressedTextures: boolean;
  textureBufferUrl?: string;
  polygonBufferUrl?: string;
}

const sliceName = 'modelData';

export const initialModelDataState: ModelDataState = {
  models: [],
  textureDefs: [],
  editedTextures: {},
  textureHistory: {},
  polygonFileName: undefined,
  textureFileName: undefined,
  textureFileType: undefined,
  hasEditedTextures: false,
  hasCompressedTextures: false
};

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
      hasCompressedTextures
    }: {
      file: File;
      textureFileType: TextureFileType;
      hasCompressedTextures?: boolean;
      providedBuffer?: Buffer;
      providedTextureDefs?: NLTextureDef[];
    },
    { getState, dispatch }
  ) => {
    const state = getState();

    let textureDefs: NLTextureDef[];

    if (textureFileType !== 'polygon-mapped') {
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

    if (hasCompressedTextures) {
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
        payload: { fileName, textureDefs, buffer, hasCompressedTextures }
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
    const { textureFileName, textureBufferUrl } = state.modelData;
    const textureDefs = selectUpdatedTextureDefs(state);
    const textureFileType = selectTextureFileType(state);
    const hasCompressedTextures = selectHasCompressedTextures(state);

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
        textureBufferUrl: textureBufferUrl as string,
        textureFileType,
        hasCompressedTextures
      });
    } catch (error: unknown) {
      console.error(error);
      dispatch(
        showError({
          title: 'Error exporting texture',
          message: ((error as Error)?.message || error) as string
        })
      );
    }
  }
);

const modelDataSlice = createSlice({
  name: sliceName,
  initialState: initialModelDataState,
  reducers: {
    replaceTextureImage(
      state,
      {
        payload: { textureIndex, bufferUrls, dataUrls }
      }: PayloadAction<{
        textureIndex: number;
        bufferUrls: SourceTextureData;
        dataUrls: SourceTextureData;
      }>
    ) {
      // @TODO: for better UX, re-apply existing HSL on new image automagically
      // in thunk that led to this fulfilled action
      // clear previous edited texture when replacing a texture image
      if (state.editedTextures[textureIndex]) {
        state.editedTextures = Object.fromEntries(
          Object.entries(state.editedTextures).filter(
            ([k]) => Number(k) !== textureIndex
          )
        );
      }

      state.textureHistory[textureIndex] =
        state.textureHistory[textureIndex] || [];
      state.textureHistory[textureIndex].push({
        bufferUrls: state.textureDefs[textureIndex]
          .bufferUrls as SourceTextureData,
        dataUrls: state.textureDefs[textureIndex].dataUrls as SourceTextureData
      });

      state.textureDefs[textureIndex].bufferUrls = bufferUrls;
      state.textureDefs[textureIndex].dataUrls = dataUrls;
      state.hasEditedTextures = true;
    },
    revertTextureImage(
      state,
      { payload: { textureIndex } }: PayloadAction<{ textureIndex: number }>
    ) {
      // only valid if there's an actual texture to revert to
      if (state.textureHistory[textureIndex].length === 0) {
        return state;
      }

      // remove editedTexture state in case of hsl changes
      state.editedTextures = Object.fromEntries(
        Object.entries(state.editedTextures).filter(
          ([k]) => k !== textureIndex.toString()
        )
      );

      const textureHistory = state.textureHistory[textureIndex].pop();

      if (textureHistory) {
        state.textureDefs[textureIndex].bufferUrls.translucent =
          textureHistory.bufferUrls.translucent;
        state.textureDefs[textureIndex].bufferUrls.opaque =
          textureHistory.bufferUrls.opaque;

        state.textureDefs[textureIndex].dataUrls.translucent =
          textureHistory.dataUrls.translucent;
        state.textureDefs[textureIndex].dataUrls.opaque =
          textureHistory.dataUrls.opaque;
      }

      return state;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(
      loadPolygonFile.fulfilled,
      (
        state: ModelDataState,
        { payload: { models, textureDefs, fileName, polygonBufferUrl } }
      ) => {
        state.models = models;
        state.textureDefs = textureDefs;
        state.editedTextures = {};
        state.textureHistory = {};
        state.textureFileType = undefined;

        state.polygonFileName = fileName;
        state.textureFileName = undefined;
        state.polygonBufferUrl = polygonBufferUrl;
        state.hasEditedTextures = false;
      }
    );

    builder.addCase(
      loadTextureFile.fulfilled,
      (state: ModelDataState, { payload }) => {
        const {
          textureDefs,
          fileName,
          hasCompressedTextures,
          textureBufferUrl,
          textureFileType
        } = payload;

        state.textureDefs = textureDefs;
        state.editedTextures = {};
        state.hasEditedTextures = false;
        state.textureHistory = {};
        state.textureFileType = textureFileType;

        state.textureFileName = fileName;
        state.hasCompressedTextures = hasCompressedTextures;
        state.textureBufferUrl = textureBufferUrl;
      }
    );

    builder.addCase(
      loadCharacterPortraitsFile.pending,
      (state: ModelDataState) => {
        state.polygonBufferUrl = undefined;
        state.textureBufferUrl = undefined;
        state.textureDefs = [];
        state.textureHistory = {};
      }
    );

    builder.addCase(
      adjustTextureHsl.fulfilled,
      (
        state: ModelDataState,
        { payload: { textureIndex, bufferUrls, dataUrls, hsl } }
      ) => {
        const { width, height } = state.textureDefs[textureIndex];
        if (hsl.h != 0 || hsl.s != 0 || hsl.l != 0) {
          state.editedTextures[textureIndex] = {
            width,
            height,
            bufferUrls,
            dataUrls,
            hsl
          };
        } else {
          const entries = Object.entries(state.editedTextures).filter(
            ([k]) => Number(k) !== textureIndex
          );

          state.editedTextures = Object.fromEntries(entries);
        }
        state.hasEditedTextures =
          state.hasEditedTextures ||
          Object.keys(state.editedTextures).length > 0;
      }
    );

    builder.addCase(HYDRATE, (state, { payload }: AnyAction) =>
      Object.assign(state, payload)
    );
  }
});

export const { revertTextureImage, replaceTextureImage } =
  modelDataSlice.actions;

export default modelDataSlice;
