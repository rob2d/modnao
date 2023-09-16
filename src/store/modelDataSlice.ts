import {
  AnyAction,
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { NLTextureDef } from '@/types/NLAbstractions';
import { WorkerEvent } from '@/worker';
import exportTextureFile from '../utils/textures/files/exportTextureFile';
import { AppState } from './store';
import HslValues from '@/utils/textures/HslValues';
import { selectSceneTextureDefs } from './selectors';
import { SourceTextureData } from '@/utils/textures/SourceTextureData';
import WorkerThreadPool from '../utils/WorkerThreadPool';
import { decompressTextureBuffer } from '@/utils/textures/parse';
import { batch } from 'react-redux';
import { TextureFileType } from '@/utils/textures/files/textureFileTypeMap';

const workerPool = new WorkerThreadPool();

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

export type LoadPolygonsPayload = {
  models: NLModel[];
  textureDefs: NLTextureDef[];
  fileName: string;
  polygonBufferUrl: string;
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

// @TODO: decompress image vector quantization for 2nd and 3rd texture
// when loading a character portrait file
export const loadCharacterPortraitsFile = createAsyncThunk<
  LoadTexturesPayload,
  File,
  { state: AppState }
>(`${sliceName}/loadCharacterPortraitsFile`, async (file, { dispatch }) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // grab pointers
  const pointers = [
    buffer.readUInt32LE(0),
    buffer.readUInt32LE(4),
    buffer.readUInt32LE(8)
  ];

  const uint8Array = new Uint8Array(arrayBuffer);

  // retrieve the compressed sub-areas to decompress
  const compressedSection = uint8Array.slice(pointers[0], pointers[1]);

  const decompressedSection = await decompressTextureBuffer(
    Buffer.from(compressedSection)
  );

  const size = 12 + decompressedSection.length;

  let position = 12;
  const bufferStart = Buffer.alloc(size);
  bufferStart.writeUInt32LE(12, 0);
  bufferStart.writeUInt32LE(size, 4);
  bufferStart.writeUInt32LE(size + (pointers[2] - pointers[1]), 8);

  const decompressedOffsets = [];

  for (const section of [decompressedSection]) {
    bufferStart.set(section, position);
    decompressedOffsets.push(position);
    position += section.length;
  }

  const decompressedBuffer = Buffer.concat([
    bufferStart,
    uint8Array.slice(pointers[1])
  ]);

  const rleTextureSizes = [
    { width: 64, height: 64 },
    { width: 64, height: 64 },
    { width: 128, height: 128 }
  ];

  const textureDefs = decompressedOffsets.map((offset, i) => ({
    ...rleTextureSizes[i],
    colorFormat: 'RGB565',
    colorFormatValue: 2,
    bufferUrls: {
      translucent: undefined,
      opaque: undefined
    },
    dataUrls: {
      translucent: undefined,
      opaque: undefined
    },
    type: 0,
    address: 0,
    baseLocation: offset,
    ramOffset: 0
  }));

  const thread = workerPool.allocate();

  const result = await new Promise<LoadTexturesPayload>((resolve) => {
    if (thread) {
      thread.onmessage = (event: MessageEvent<LoadTexturesResult>) => {
        const payload: LoadTexturesPayload = {
          ...event.data.result,
          hasCompressedTextures: true,
          textureFileType: 'mvc2-character-portraits'
        };

        batch(() => {
          // revoke URL for existing texture buffer url in state
          dispatch({
            type: loadPolygonFile.fulfilled.type,
            payload: {
              models: [],
              fileName: undefined,
              polygonBufferUrl: undefined,
              textureDefs
            }
          });
          dispatch({ type: loadTextureFile.fulfilled.type, payload });
        });

        resolve(payload);
        workerPool.unallocate(thread);
      };
    }

    thread?.postMessage({
      type: 'loadTextureFile',
      payload: {
        fileName: file.name,
        textureDefs,
        buffer: decompressedBuffer
      }
    } as WorkerEvent);
  });

  return result;
});

const loadCompressedTextureFiles = async (
  file: File,
  textureFileType: TextureFileType,
  textureDefs: NLTextureDef[],
  onDispatch: (payload: LoadTexturesPayload) => void
) => {
  const thread = workerPool.allocate();

  if (!thread) {
    return;
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = decompressTextureBuffer(Buffer.from(arrayBuffer));

  const result = await new Promise<LoadTexturesPayload>((resolve) => {
    if (thread) {
      thread.onmessage = (event: MessageEvent<LoadTexturesResult>) => {
        const payload: LoadTexturesPayload = {
          ...event.data.result,
          hasCompressedTextures: true,
          textureFileType
        };
        onDispatch(payload);
        resolve(payload);

        workerPool.unallocate(thread);
      };
    }

    thread?.postMessage({
      type: 'loadTextureFile',
      payload: {
        fileName: file.name,
        textureDefs,
        buffer
      }
    } as WorkerEvent);
  });

  return result;
};

export const loadMvc2CharacterWinFile = createAsyncThunk<
  LoadTexturesPayload,
  File,
  { state: AppState }
>(`${sliceName}/loadMvc2CharacterWinFile`, async (file, { dispatch }) => {
  const textureDefs: NLTextureDef[] = [
    {
      width: 256,
      height: 256,
      colorFormat: 'ARGB4444',
      colorFormatValue: 2,
      bufferUrls: {
        translucent: undefined,
        opaque: undefined
      },
      dataUrls: {
        translucent: undefined,
        opaque: undefined
      },
      type: 0,
      address: 0,
      baseLocation: 0,
      ramOffset: 0
    }
  ];

  const result = (await loadCompressedTextureFiles(
    file,
    'mvc2-character-win',
    textureDefs,
    (payload: LoadTexturesPayload) =>
      batch(() => {
        dispatch({
          type: loadPolygonFile.fulfilled.type,
          payload: {
            models: [],
            fileName: undefined,
            polygonBufferUrl: undefined,
            textureDefs
          }
        });
        dispatch({ type: loadTextureFile.fulfilled.type, payload });
      })
  )) as LoadTexturesPayload;

  return result;
});

export const loadMvc2StagePreviewsFile = createAsyncThunk<
  LoadTexturesPayload,
  File,
  { state: AppState }
>(`${sliceName}/loadMvc2StagePreviewsFile`, async (file, { dispatch }) => {
  const textureDefs: NLTextureDef[] = [];

  for (let i = 0; i < 18; i++) {
    textureDefs.push({
      width: 128,
      height: 128,
      colorFormat: 'RGB565',
      colorFormatValue: 2,
      bufferUrls: {
        translucent: undefined,
        opaque: undefined
      },
      dataUrls: {
        translucent: undefined,
        opaque: undefined
      },
      type: 0,
      address: 0,
      baseLocation: i * 128 * 128 * 2,
      ramOffset: 0
    });
  }

  textureDefs.push({
    width: 64,
    height: 64,
    colorFormat: 'ARGB4444',
    colorFormatValue: 2,
    bufferUrls: {
      translucent: undefined,
      opaque: undefined
    },
    dataUrls: {
      translucent: undefined,
      opaque: undefined
    },
    type: 0,
    address: 0,
    baseLocation: 18 * 128 * 128 * 2,
    ramOffset: 0
  });

  const result = (await loadCompressedTextureFiles(
    file,
    'mvc2-stage-preview',
    textureDefs,
    (payload: LoadTexturesPayload) =>
      // TODO: DRY into action
      batch(() => {
        dispatch({
          type: loadPolygonFile.fulfilled.type,
          payload: {
            models: [],
            fileName: undefined,
            polygonBufferUrl: undefined,
            textureDefs
          }
        });
        dispatch({ type: loadTextureFile.fulfilled.type, payload });
      })
  )) as LoadTexturesPayload;

  return result;
});

export const loadMvc2EndFile = createAsyncThunk<
  LoadTexturesPayload,
  File,
  { state: AppState }
>(`${sliceName}/loadMvc2EndFile`, async (file, { dispatch }) => {
  const textureDefs: NLTextureDef[] = [];

  for (let i = 0; i < 16; i++) {
    textureDefs.push({
      width: 256,
      height: 256,
      colorFormat: 'RGB565',
      colorFormatValue: 2,
      bufferUrls: {
        translucent: undefined,
        opaque: undefined
      },
      dataUrls: {
        translucent: undefined,
        opaque: undefined
      },
      type: 0,
      address: 0,
      baseLocation: i * 256 * 256 * 2,
      ramOffset: 0
    });
  }

  textureDefs.push({
    width: 128,
    height: 128,
    colorFormat: 'ARGB4444',
    colorFormatValue: 2,
    bufferUrls: {
      translucent: undefined,
      opaque: undefined
    },
    dataUrls: {
      translucent: undefined,
      opaque: undefined
    },
    type: 0,
    address: 0,
    baseLocation: 256 * 256 * 16 * 2,
    ramOffset: 0
  });

  textureDefs.push({
    width: 128,
    height: 128,
    colorFormat: 'ARGB4444',
    colorFormatValue: 2,
    bufferUrls: {
      translucent: undefined,
      opaque: undefined
    },
    dataUrls: {
      translucent: undefined,
      opaque: undefined
    },
    type: 0,
    address: 0,
    baseLocation: 256 * 256 * 16 * 2 + 128 * 128 * 2,
    ramOffset: 0
  });

  const result = (await loadCompressedTextureFiles(
    file,
    'mvc2-end-file',
    textureDefs,
    (payload: LoadTexturesPayload) =>
      batch(() => {
        dispatch({
          type: loadPolygonFile.fulfilled.type,
          payload: {
            models: [],
            fileName: undefined,
            polygonBufferUrl: undefined,
            textureDefs
          }
        });
        dispatch({ type: loadTextureFile.fulfilled.type, payload });
      })
  )) as LoadTexturesPayload;

  return result;
});

export const loadPolygonFile = createAsyncThunk<
  LoadPolygonsPayload,
  File,
  { state: AppState }
>(
  `${sliceName}/loadPolygonFile`,
  async (file: File, { getState }): Promise<LoadPolygonsPayload> => {
    const { modelData } = getState();
    const buffer = await file.arrayBuffer();
    const thread = workerPool.allocate();

    const result = await new Promise<LoadPolygonsPayload>((resolve) => {
      if (thread) {
        const prevPolygonBufferUrl = modelData.polygonBufferUrl;
        thread.onmessage = (event: MessageEvent<LoadPolygonsResult>) => {
          resolve(event.data.result);

          if (prevPolygonBufferUrl) {
            URL.revokeObjectURL(prevPolygonBufferUrl);
          }

          workerPool.unallocate(thread);
        };

        thread?.postMessage({
          type: 'loadPolygonFile',
          payload: { buffer, fileName: file.name }
        } as WorkerEvent);
      }
    });

    return result;
  }
);

export const loadTextureFile = createAsyncThunk<
  LoadTexturesPayload,
  { file: File; textureFileType: TextureFileType },
  { state: AppState }
>(
  `${sliceName}/loadTextureFile`,
  async ({ file, textureFileType }, { getState }) => {
    const state = getState();
    const { textureDefs } = state.modelData;
    const buffer = new Uint8Array(await file.arrayBuffer());
    const prevTextureBufferUrl = state.modelData.textureBufferUrl;
    const thread = workerPool.allocate();

    const result = await new Promise<LoadTexturesPayload>((resolve) => {
      if (thread) {
        thread.onmessage = (event: MessageEvent<LoadTexturesResult>) => {
          resolve(event.data.result);

          // deallocate existing blob
          if (prevTextureBufferUrl) {
            URL.revokeObjectURL(prevTextureBufferUrl);
          }

          workerPool.unallocate(thread);
        };

        const fileName = file.name;
        thread?.postMessage({
          type: 'loadTextureFile',
          payload: {
            fileName,
            textureDefs,
            buffer
          }
        } as WorkerEvent);
      }
    });

    return { ...result, textureFileType };
  }
);

export const adjustTextureHsl = createAsyncThunk<
  AdjustTextureHslPayload,
  { textureIndex: number; hsl: HslValues },
  { state: AppState }
>(
  `${sliceName}/adjustTextureHsl`,
  async ({ textureIndex, hsl }, { getState }) => {
    const state = getState();
    const textureDef = state.modelData.textureDefs[textureIndex];
    const { width, height, bufferUrls: sourceTextureData } = textureDef;
    const thread = workerPool.allocate();

    const result = await new Promise<AdjustTextureHslPayload>((resolve) => {
      if (thread) {
        thread.onmessage = (event: MessageEvent<AdjustTextureHslResult>) => {
          resolve(event.data.result);
          workerPool.unallocate(thread);
        };

        thread?.postMessage({
          type: 'adjustTextureHsl',
          payload: {
            hsl,
            textureIndex,
            sourceTextureData,
            width,
            height
          }
        } as WorkerEvent);
      }
    });

    return result;
  }
);

export const downloadTextureFile = createAsyncThunk<
  void,
  void,
  { state: AppState }
>(`${sliceName}/downloadTextureFile`, async (_, { getState }) => {
  const state = getState();
  const { textureFileName, hasCompressedTextures, textureBufferUrl } =
    state.modelData;
  const textureDefs = selectSceneTextureDefs(state);
  const textureFileType = state.modelData.textureFileType;

  if (!textureFileType) {
    window.alert('no valid texture filetype was loaded');
    return;
  }

  try {
    await exportTextureFile(
      textureDefs,
      textureFileName,
      hasCompressedTextures,
      textureBufferUrl as string,
      textureFileType
    );
  } catch (error) {
    window.alert(error);
  }
});

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
