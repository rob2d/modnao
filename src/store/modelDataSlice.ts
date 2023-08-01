import {
  AnyAction,
  createAction,
  createAsyncThunk,
  createSlice
} from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import processPolygonBuffer from './model-data/processPolygonBuffer';
import exportTextureFile from '../utils/textures/files/exportTextureFile';
import { AppState, store } from './store';
import { NLTextureDef, TextureDataUrlType } from '@/types/NLAbstractions';
import getImageDimensionsFromDataUrl from '@/utils/images/getImageDimensionsFromDataUrl';
import nonSerializables from './nonSerializables';
import HslValues from '@/utils/textures/HslValues';
import { selectSceneTextureDefs } from './selectors';
import storeSourceTextureData from './model-data/storeSourceTextureData';
import { WorkerEvent, WorkerResponses } from '@/worker';
import { bufferToObjectUrl } from '@/utils/data';

let worker: Worker;

if (globalThis.Worker) {
  worker = new Worker(new URL('../worker.ts', import.meta.url), {
    type: 'module'
  });

  worker.onmessage = async (event: MessageEvent<WorkerResponses>) => {
    switch (event.data.type) {
      case 'loadTextureFile': {
        const {
          result: {
            buffer,
            textureDefs,
            fileName,
            hasCompressedTextures,
            sourceTextureData
          }
        } = event.data;

        // store sourceTextureData for color edits
        nonSerializables.sourceTextureData = sourceTextureData;

        const textureBufferUrl = await bufferToObjectUrl(buffer);

        store.dispatch(
          loadTextureFromThread({
            textureDefs,
            fileName,
            hasCompressedTextures,
            textureBufferUrl
          })
        );
        break;
      }
      case 'adjustTextureHsl': {
        const {
          result: { hsl, textureIndex, textureDataUrls }
        } = event.data;

        store.dispatch(
          adjustTextureHslFromThread({
            hsl,
            textureIndex,
            textureDataUrls
          })
        );
        break;
      }
    }
  };
}

export interface ModelDataState {
  models: NLModel[];
  textureDefs: NLTextureDef[];
  editedTextures: {
    [key: number]: {
      opaque: string;
      translucent: string;
      hsl: HslValues;
    };
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
  polygonFileName: undefined,
  textureFileName: undefined,
  hasEditedTextures: false,
  hasCompressedTextures: false
};

export const loadPolygonFile = createAsyncThunk<
  {
    models: NLModel[];
    textureDefs: NLTextureDef[];
    fileName: string;
    polygonBufferUrl: string;
  },
  File,
  { state: AppState }
>(`${sliceName}/loadPolygonFile`, async (file: File, { getState }) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await processPolygonBuffer(buffer);
  const polygonBufferUrl = await bufferToObjectUrl(buffer);
  const state = getState();

  if (state.modelData.polygonBufferUrl) {
    URL.revokeObjectURL(state.modelData.polygonBufferUrl);
  }

  return {
    ...result,
    fileName: file.name,
    polygonBufferUrl
  };
});

export const adjustTextureHsl = createAsyncThunk<
  void,
  { textureIndex: number; hsl: HslValues }
>(`${sliceName}/adjustTextureHsl`, async ({ textureIndex, hsl }) => {
  const sourceTextureData = nonSerializables.sourceTextureData[textureIndex];

  worker.postMessage({
    type: 'adjustTextureHsl',
    payload: { hsl, textureIndex, sourceTextureData }
  } as WorkerEvent);
});

export const adjustTextureHslFromThread = createAction<
  {
    hsl: HslValues;
    textureIndex: number;
    textureDataUrls: { translucent: string; opaque: string };
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
  const buffer = Buffer.from(await file.arrayBuffer());

  // deallocate existing blob
  if (state.modelData.textureBufferUrl) {
    URL.revokeObjectURL(state.modelData.textureBufferUrl);
  }

  worker.postMessage({
    type: 'loadTextureFile',
    payload: {
      fileName,
      textureDefs,
      buffer
    }
  } as WorkerEvent);
});

export const loadTextureFromThread = createAsyncThunk<
  {
    textureDefs: NLTextureDef[];
    fileName: string;
    textureBufferUrl: string;
    hasCompressedTextures: boolean;
  },
  {
    textureDefs: NLTextureDef[];
    fileName: string;
    textureBufferUrl: string;
    hasCompressedTextures: boolean;
  },
  { state: AppState }
>(`${sliceName}/loadTextureFromThread`, async (payload, { getState }) => {
  const { modelData } = getState();
  if (modelData.textureBufferUrl) {
    URL.revokeObjectURL(modelData.textureBufferUrl);
  }

  return payload;
});

export const replaceTextureDataUrl = createAsyncThunk<
  { textureIndex: number; dataUrl: string },
  { textureIndex: number; dataUrl: string },
  { state: AppState }
>(
  `${sliceName}/replaceTextureDataUrl`,
  async ({ textureIndex, dataUrl }, { getState }) => {
    const state = getState();
    const { textureDefs } = state.modelData;
    const def = textureDefs[textureIndex];

    const [width, height] = await getImageDimensionsFromDataUrl(dataUrl);

    if (width !== def.width || height !== def.height) {
      throw new Error(
        `size of texture must match the original (${width} x ${height})}`
      );
    }

    // @TODO process both opaque and non-opaque textures
    // and then update state for both in action

    await storeSourceTextureData(
      {
        opaque: dataUrl,
        translucent: dataUrl
      },
      textureIndex
    );

    return { textureIndex, dataUrl };
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
    console.error(error);
  }
});

const modelDataSlice = createSlice({
  name: sliceName,
  initialState: initialModelDataState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      loadPolygonFile.fulfilled,
      (
        state: ModelDataState,
        { payload: { models, textureDefs, fileName, polygonBufferUrl } }
      ) => {
        state.models = models;
        state.textureDefs = textureDefs;
        state.editedTextures = [];
        state.polygonFileName = fileName;
        state.textureFileName = undefined;
        state.polygonBufferUrl = polygonBufferUrl;
      }
    );

    builder.addCase(
      loadTextureFromThread.fulfilled,
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
        state.editedTextures = [];
        state.textureFileName = fileName;
        state.hasCompressedTextures = hasCompressedTextures;
        state.textureBufferUrl = textureBufferUrl;
      }
    );

    builder.addCase(
      replaceTextureDataUrl.fulfilled,
      (state: ModelDataState, { payload: { textureIndex, dataUrl } }) => {
        const dataUrlTypes = Object.keys(
          state.textureDefs[textureIndex].dataUrls
        ) as TextureDataUrlType[];

        dataUrlTypes.forEach((key) => {
          state.textureDefs[textureIndex].dataUrls[key] = dataUrl;
        });

        // remove existing edited textures since these
        // take precedence on rendering scenes

        if (state.editedTextures[textureIndex]) {
          const filteredEntries = Object.entries(state.editedTextures).filter(
            ([i]) => Number(i) !== textureIndex
          );

          state.editedTextures = Object.fromEntries(filteredEntries);
        }

        state.hasEditedTextures = true;
      }
    );

    builder.addCase(
      adjustTextureHslFromThread,
      (
        state: ModelDataState,
        { payload: { textureIndex, textureDataUrls, hsl } }
      ) => {
        if (hsl.h != 0 || hsl.s != 0 || hsl.l != 0) {
          state.editedTextures[textureIndex] = {
            ...textureDataUrls,
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

export default modelDataSlice;
