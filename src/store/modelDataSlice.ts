import {
  AnyAction,
  createAction,
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
import worker from './storeActionsWorker';

type EditedTexture = {
  width: number;
  height: number;
  bufferUrls: {
    translucent: string;
    opaque: string;
  };
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
  prevBufferUrls: {
    [key: number]: {
      translucent: string;
      opaque: string;
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
  prevBufferUrls: {},
  polygonFileName: undefined,
  textureFileName: undefined,
  hasEditedTextures: false,
  hasCompressedTextures: false
};

export const loadPolygonFile = createAsyncThunk<
  void,
  File,
  { state: AppState }
>(`${sliceName}/loadPolygonFile`, async (file: File) => {
  const buffer = await file.arrayBuffer();

  worker?.postMessage({
    type: 'loadPolygonFile',
    payload: { buffer }
  } as WorkerEvent);
});

export type LoadPolygonsPayload = {
  models: NLModel[];
  textureDefs: NLTextureDef[];
  fileName: string;
  polygonBufferUrl: string;
};

export const loadPolygonsFromWorker = createAsyncThunk<
  LoadPolygonsPayload,
  LoadPolygonsPayload,
  { state: AppState }
>(`${sliceName}/loadPolygonsFromWorker`, async (payload, { getState }) => {
  const { modelData } = getState();
  if (modelData.polygonBufferUrl) {
    URL.revokeObjectURL(modelData.polygonBufferUrl);
  }

  return payload;
});

export const adjustTextureHsl = createAsyncThunk<
  void,
  { textureIndex: number; hsl: HslValues },
  { state: AppState }
>(
  `${sliceName}/adjustTextureHsl`,
  async ({ textureIndex, hsl }, { getState }) => {
    const state = getState();
    const sourceTextureData =
      state.modelData.textureDefs[textureIndex].bufferUrls;

    worker?.postMessage({
      type: 'adjustTextureHsl',
      payload: { hsl, textureIndex, sourceTextureData }
    } as WorkerEvent);
  }
);

export const adjustTextureHslFromThread = createAction<
  {
    hsl: HslValues;
    textureIndex: number;
    bufferUrls: { translucent: string; opaque: string };
  },
  `${typeof sliceName}/adjustTextureHslFromThread`
>(`${sliceName}/adjustTextureHslFromThread`);

export const loadTextureFile = createAsyncThunk<
  void,
  File,
  { state: AppState }
>(`${sliceName}/loadTextureFile`, async (file, { getState }) => {
  const state = getState();
  const { textureDefs } = state.modelData;
  const fileName = file.name;
  const buffer = new Uint8Array(await file.arrayBuffer());

  // deallocate existing blob
  if (state.modelData.textureBufferUrl) {
    URL.revokeObjectURL(state.modelData.textureBufferUrl);
  }

  worker?.postMessage({
    type: 'loadTextureFile',
    payload: {
      fileName,
      textureDefs,
      buffer
    }
  } as WorkerEvent);
});

export type LoadTexturesPayload = {
  textureDefs: NLTextureDef[];
  fileName: string;
  textureBufferUrl: string;
  hasCompressedTextures: boolean;
};
export const loadTexturesFromWorker = createAsyncThunk<
  LoadTexturesPayload,
  LoadTexturesPayload,
  { state: AppState }
>(`${sliceName}/loadTexturesFromWorker`, async (payload, { getState }) => {
  const { modelData } = getState();
  if (modelData.textureBufferUrl) {
    URL.revokeObjectURL(modelData.textureBufferUrl);
  }

  return payload;
});

export const replaceTextureImage = createAsyncThunk<
  { textureIndex: number; bufferUrls: SourceTextureData },
  { textureIndex: number; bufferUrls: SourceTextureData },
  { state: AppState }
>(`${sliceName}/replaceTextureImage`, async ({ textureIndex, bufferUrls }) => {
  /*
  @TODO: complete rewriting logic to ensure size matches
    const state = getState();

    // const textureDef = state.modelData.textureDefs[textureIndex];
    // const { width, height } = textureDef;
    if (width !== def.width || height !== def.height) {
      throw new Error(
        `size of texture must match the original (${width} x ${height})}`
      );
    }
    */

  return {
    textureIndex,
    bufferUrls
  };
});

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
    revertTextureImage(
      state,
      { payload: { textureIndex } }: PayloadAction<{ textureIndex: number }>
    ) {
      // only valid if there's an actual texture to revert to
      if (state.prevBufferUrls[textureIndex].length === 0) {
        return state;
      }

      // remove editedTexture state in case of hsl changes
      state.editedTextures = Object.fromEntries(
        Object.entries(state.editedTextures).filter(
          ([k]) => k !== textureIndex.toString()
        )
      );

      const prevBufferUrls = state.prevBufferUrls[
        textureIndex
      ].pop() as SourceTextureData;

      state.textureDefs[textureIndex].bufferUrls.translucent =
        prevBufferUrls.translucent;
      state.textureDefs[textureIndex].bufferUrls.opaque = prevBufferUrls.opaque;
      return state;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(
      loadPolygonsFromWorker.fulfilled,
      (
        state: ModelDataState,
        { payload: { models, textureDefs, fileName, polygonBufferUrl } }
      ) => {
        state.models = models;
        state.textureDefs = textureDefs;
        state.editedTextures = {};
        state.polygonFileName = fileName;
        state.textureFileName = undefined;
        state.polygonBufferUrl = polygonBufferUrl;
      }
    );

    builder.addCase(
      loadTexturesFromWorker.fulfilled,
      (
        state: ModelDataState,
        {
          payload: {
            textureDefs,
            fileName,
            hasCompressedTextures,
            textureBufferUrl
          }
        }
      ) => {
        state.textureDefs = textureDefs;
        state.editedTextures = {};
        state.textureFileName = fileName;
        state.hasCompressedTextures = hasCompressedTextures;
        state.textureBufferUrl = textureBufferUrl;
      }
    );

    builder.addCase(
      replaceTextureImage.fulfilled,
      (state: ModelDataState, { payload: { textureIndex, bufferUrls } }) => {
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

        state.prevBufferUrls[textureIndex] =
          state.prevBufferUrls[textureIndex] || [];
        state.prevBufferUrls[textureIndex].push(
          state.textureDefs[textureIndex].bufferUrls as SourceTextureData
        );

        state.textureDefs[textureIndex].bufferUrls = bufferUrls;
        state.hasEditedTextures = true;
      }
    );

    builder.addCase(
      adjustTextureHslFromThread,
      (
        state: ModelDataState,
        { payload: { textureIndex, bufferUrls, hsl } }
      ) => {
        const { width, height } = state.textureDefs[textureIndex];
        if (hsl.h != 0 || hsl.s != 0 || hsl.l != 0) {
          state.editedTextures[textureIndex] = {
            width,
            height,
            bufferUrls,
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

export const { revertTextureImage } = modelDataSlice.actions;

export default modelDataSlice;
