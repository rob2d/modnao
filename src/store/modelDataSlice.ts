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
  hasEditedTextures: false,
  hasCompressedTextures: false
};

export const loadDedicatedTextureFile = createAsyncThunk<
  void,
  File,
  { state: AppState }
>(
  `${sliceName}/loadDedicatedTextureFile`,
  async (file, { getState, dispatch }) => {
    window.alert('These dedicated texture files are not yet supported');
    /*
    const pointer1 = buffer.readUInt32LE(0);
    const pointer2 = buffer.readUInt32LE(4);
    const pointer3 = buffer.readUInt32LE(8);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // revoke URL for existing texture buffer url in state
    dispatch({
      type: loadPolygonFile.fulfilled.type,
      payload: {
        models: [],
        fileName: undefined,
        polygonBufferUrl: undefined,
        textureDefs: [
          {
            width: 128,
            height: 128,
            colorFormat: 'RGB565',
            colorFormatValue: 2,
            bufferUrls: {},
            dataUrls: {},
            type: 0,
            address: 0,
            baseLocation: pointer3,
            ramOffset: 0
          }
        ]
      }
    });

    await dispatch(loadTextureFile(file));
    */
  }
);

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
          payload: { buffer }
        } as WorkerEvent);
      }
    });

    return result;
  }
);

export const loadTextureFile = createAsyncThunk<
  LoadTexturesPayload,
  File,
  { state: AppState }
>(`${sliceName}/loadTextureFile`, async (file, { getState }) => {
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

  return result;
});

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

  try {
    await exportTextureFile(
      textureDefs,
      textureFileName,
      hasCompressedTextures,
      textureBufferUrl as string
    );
  } catch (error) {
    window.alert(error);
    console.error(error);
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
          textureBufferUrl
        } = payload;

        state.textureDefs = textureDefs;
        state.editedTextures = {};
        state.hasEditedTextures = false;
        state.textureHistory = {};

        state.textureFileName = fileName;
        state.hasCompressedTextures = hasCompressedTextures;
        state.textureBufferUrl = textureBufferUrl;
      }
    );

    builder.addCase(
      loadDedicatedTextureFile.pending,
      (state: ModelDataState) => {
        state.polygonBufferUrl = undefined;
        state.textureBufferUrl = undefined;
        state.textureDefs = [];
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
