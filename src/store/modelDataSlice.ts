import {
  AnyAction,
  createAction,
  createAsyncThunk,
  createSlice
} from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import processPolygonBuffer from './model-data/processPolygonBuffer';
import exportTextureFile from './model-data/exportTextureFile';
import { AppState, store } from './store';
import { NLTextureDef, TextureDataUrlType } from '@/types/NLAbstractions';
import getImageDimensions from '@/utils/images/getImageDimensions';
import nonSerializables from './nonSerializables';
import processTextureHsl from '@/utils/textures/adjustTextureHsl';
import HslValues from '@/utils/textures/HslValues';
import { selectSceneTextureDefs } from './selectors';
import storeSourceTextureData from './model-data/storeSourceTextureData';
import { WorkerEvent } from '@/worker';

let worker: Worker;

if (globalThis.Worker) {
  worker = new Worker(new URL('../worker.ts', import.meta.url));

  worker.onmessage = (event: MessageEvent<WorkerEvent>) => {
    switch (event.data.type) {
      case 'loadTextureFile': {
        const {
          payload: {
            buffer,
            models,
            textureDefs,
            fileName,
            hasCompressedTextures
          }
        } = event.data;

        // store textureBuffer for ops
        nonSerializables.textureBuffer = buffer;

        store.dispatch(
          loadTexture({
            models,
            textureDefs,
            fileName,
            hasCompressedTextures
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
  { models: NLModel[]; textureDefs: NLTextureDef[]; fileName: string },
  File
>(`${sliceName}/loadPolygonFile`, async (file: File) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await processPolygonBuffer(buffer);
  nonSerializables.polygonBuffer = buffer;

  return {
    ...result,
    fileName: file.name
  };
});

export const adjustTextureHsl = createAsyncThunk<
  {
    textureIndex: number;
    hsl: HslValues;
    textureDataUrls: { translucent: string; opaque: string };
  },
  { textureIndex: number; hsl: HslValues }
>(`${sliceName}/adjustTextureHsl`, async ({ textureIndex, hsl }) => {
  const sourceTextureData = nonSerializables.sourceTextureData[textureIndex];

  try {
    const [opaque, translucent] = await Promise.all([
      processTextureHsl(sourceTextureData.opaque, hsl),
      processTextureHsl(sourceTextureData.translucent, hsl)
    ]);

    return {
      textureIndex,
      hsl,
      textureDataUrls: { translucent, opaque }
    };
  } catch (error) {
    console.error(error);
    return {
      textureIndex,
      hsl,
      textureDataUrls: { translucent: '', opaque: '' }
    };
  }
});

export const loadTextureFileOnWorker = createAsyncThunk<
  void,
  File,
  { state: AppState }
>(`${sliceName}/loadTextureFileOnWorker`, async (file, { getState }) => {
  const state = getState();
  const { models, textureDefs } = state.modelData;
  const fileName = file.name;
  const buffer = Buffer.from(await file.arrayBuffer());

  worker.postMessage({
    type: 'loadTextureFile',
    payload: { fileName, models, textureDefs, buffer }
  });
});

export const loadTexture = createAction<
  {
    models: NLModel[];
    textureDefs: NLTextureDef[];
    fileName: string;
    hasCompressedTextures: boolean;
  },
  `${typeof sliceName}/loadTexture`
>(`${sliceName}/loadTexture`);

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

    const [width, height] = await getImageDimensions(dataUrl);

    if (width !== def.width || height !== def.height) {
      throw new Error(
        `size of texture must match the original (${width} x ${height})}`
      );
    }

    // @TODO process both opaque and non-opaque textures
    // and then update state for both in action

    await storeSourceTextureData(dataUrl, textureIndex);

    return { textureIndex, dataUrl };
  }
);

export const downloadTextureFile = createAsyncThunk<
  void,
  void,
  { state: AppState }
>(`${sliceName}/downloadTextureFile`, async (_, { getState }) => {
  const state = getState();
  const { textureFileName, hasCompressedTextures } = state.modelData;
  const textureDefs = selectSceneTextureDefs(state);
  try {
    await exportTextureFile(
      textureDefs,
      textureFileName,
      hasCompressedTextures
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
        { payload: { models, textureDefs, fileName } }
      ) => {
        state.models = models;
        state.textureDefs = textureDefs;
        state.editedTextures = [];
        state.polygonFileName = fileName;
        state.textureFileName = undefined;
      }
    );

    builder.addCase(
      loadTexture,
      (
        state: ModelDataState,
        { payload: { models, textureDefs, fileName, hasCompressedTextures } }
      ) => {
        state.models = models;
        state.textureDefs = textureDefs;
        state.editedTextures = [];
        state.textureFileName = fileName;
        state.hasCompressedTextures = hasCompressedTextures;
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
      adjustTextureHsl.fulfilled,
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
