import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import processPolygonFile from './stage-data/processPolygonFile';
import processTextureFile from './stage-data/processTextureFile';
import exportTextureFile from './stage-data/exportTextureFile';
import { AppState } from './store';
import { NLTextureDef, TextureDataUrlType } from '@/types/NLAbstractions';
import getImageDimensions from '@/utils/images/getImageDimensions';

export interface StageDataState {
  models: NLModel[];
  textureDefs: NLTextureDef[];
  replacedTextureDataUrls: Record<number, string>;
  polygonFileName?: string;
  textureFileName?: string;
  hasReplacementTextures: boolean;
}

const sliceName = 'modelData';

export const initialStageDataState: StageDataState = {
  models: [],
  textureDefs: [],
  polygonFileName: undefined,
  textureFileName: undefined,
  hasReplacementTextures: false,
  replacedTextureDataUrls: {}
};

export const loadPolygonFile = createAsyncThunk<
  { models: NLModel[]; textureDefs: NLTextureDef[]; fileName?: string },
  File
>(`${sliceName}/loadPolygonFile`, processPolygonFile);

export const loadTextureFile = createAsyncThunk<
  { models: NLModel[]; textureDefs: NLTextureDef[]; fileName?: string },
  File,
  { state: AppState }
>(`${sliceName}/loadTextureFile`, (file, { getState }) => {
  const state = getState();
  const { models, textureDefs } = state.modelData;

  // if no polygon loaded, resolve entry data
  if (!state.modelData.polygonFileName) {
    return Promise.resolve({ models, textureDefs, fileName: undefined });
  }

  return processTextureFile(file, models, textureDefs);
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

    const [width, height] = await getImageDimensions(dataUrl);

    if (width !== def.width || height !== def.height) {
      throw new Error(
        `size of texture must match the original (${width} x ${height})}`
      );
    }

    return { textureIndex, dataUrl };
  }
);

export const downloadTextureFile = createAsyncThunk<
  void,
  void,
  { state: AppState }
>(`${sliceName}/downloadTextureFile`, async (_, { getState }) => {
  const state = getState();
  state.modelData.textureFileName;
  await exportTextureFile(state.modelData.textureDefs);
});

const modelDataSlice = createSlice({
  name: sliceName,
  initialState: initialStageDataState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      loadPolygonFile.fulfilled,
      (
        state: StageDataState,
        { payload: { models, textureDefs, fileName } }
      ) => {
        state.models = models;
        state.textureDefs = textureDefs;
        state.polygonFileName = fileName;
        state.textureFileName = undefined;
      }
    );

    builder.addCase(
      loadTextureFile.fulfilled,
      (
        state: StageDataState,
        { payload: { models, textureDefs, fileName } }
      ) => {
        state.models = models;
        state.textureDefs = textureDefs;
        state.textureFileName = fileName;
      }
    );

    builder.addCase(
      replaceTextureDataUrl.fulfilled,
      (state: StageDataState, { payload: { textureIndex, dataUrl } }) => {
        const dataUrlTypes = Object.keys(
          state.textureDefs[textureIndex].dataUrls
        ) as TextureDataUrlType[];

        dataUrlTypes.forEach((key) => {
          state.textureDefs[textureIndex].dataUrls[key] = dataUrl;
        });

        state.hasReplacementTextures = true;
      }
    );

    builder.addCase(HYDRATE, (state, { payload }: AnyAction) =>
      Object.assign(state, payload)
    );
  }
});

export default modelDataSlice;
