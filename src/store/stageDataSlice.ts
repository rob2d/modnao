import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import processStagePolygonFile from './stage-data/processStagePolygonFile';
import processStageTextureFile from './stage-data/processStageTextureFile';
import { AppState } from './store';
import { NLTextureDef, TextureDataUrlType } from '@/types/NLAbstractions';
import getImageDimensions from '@/utils/images/getImageDimensions';

export interface StageDataState {
  models: NLModel[];
  textureDefs: NLTextureDef[];
  replacedTextureDataUrls: Record<number, string>;
  hasLoadedStagePolygonFile: boolean;
}

const sliceName = 'stageData';

export const initialStageDataState: StageDataState = {
  models: [],
  textureDefs: [],
  hasLoadedStagePolygonFile: false,
  replacedTextureDataUrls: {}
};

export const loadStagePolygonFile = createAsyncThunk<
  { models: NLModel[]; textureDefs: NLTextureDef[] },
  File
>(`${sliceName}/loadStagePolygonFile`, processStagePolygonFile);

export const loadStageTextureFile = createAsyncThunk<
  { models: NLModel[]; textureDefs: NLTextureDef[] },
  File,
  { state: AppState }
>(`${sliceName}/loadStageTextureFile`, (file, { getState }) => {
  const state = getState();
  const { models, textureDefs } = state.stageData;

  if (!state.stageData.hasLoadedStagePolygonFile) {
    return Promise.resolve({ models, textureDefs });
  }

  return processStageTextureFile(file, models, textureDefs);
});

export const replaceTextureDataUrl = createAsyncThunk<
  { textureIndex: number; dataUrl: string },
  { textureIndex: number; dataUrl: string },
  { state: AppState }
>(
  `${sliceName}/replaceTextureDataUrl`,
  async ({ textureIndex, dataUrl }, { getState }) => {
    const state = getState();
    const { textureDefs } = state.stageData;
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

const stageDataSlice = createSlice({
  name: sliceName,
  initialState: initialStageDataState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      loadStagePolygonFile.fulfilled,
      (state: StageDataState, { payload: { models, textureDefs } }) => {
        state.models = models;
        state.textureDefs = textureDefs;
        state.hasLoadedStagePolygonFile = true;
      }
    );

    builder.addCase(
      replaceTextureDataUrl.fulfilled,
      (state: StageDataState, { payload: { textureIndex, dataUrl } }) => {
        state.hasLoadedStagePolygonFile = true;
        const dataUrlTypes = Object.keys(
          state.textureDefs[textureIndex].dataUrls
        ) as TextureDataUrlType[];

        // @TODO: process both translucent and opaque
        // textures in action to resolve both variants as necessary.
        // For first iteration, just returning dataUrl with whatever
        // is passed in (defaulting to opaque)

        dataUrlTypes.forEach((key) => {
          state.textureDefs[textureIndex].dataUrls[key] = dataUrl;
        });
      }
    );

    builder.addCase(HYDRATE, (state, { payload }: AnyAction) =>
      Object.assign(state, payload)
    );

    builder.addCase(
      loadStageTextureFile.fulfilled,
      (state: StageDataState, { payload }) => {
        state.models = payload.models;
        state.textureDefs = payload.textureDefs;
      }
    );
  }
});

export default stageDataSlice;
