import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import processStagePolygonFile from './stage-data/processStagePolygonFile';
import processStageTextureFile from './stage-data/processStageTextureFile';
import { AppState } from './store';
import { NLTextureDef } from '@/types/NLAbstractions';

export interface StageDataState {
  models: NLModel[];
  textureDefs: NLTextureDef[];
  hasLoadedStagePolygonFile: boolean;
}

const sliceName = 'stageData';

export const initialStageDataState: StageDataState = {
  models: [],
  textureDefs: [],
  hasLoadedStagePolygonFile: false
};

export const loadStagePolygonFile = createAsyncThunk<
  { models: NLModel[]; textureDefs: NLTextureDef[] },
  File
>(`${sliceName}/loadStagePolygonFile`, processStagePolygonFile);

export const loadStageTextureFile = createAsyncThunk<
  { models: NLModel[]; textureDefs: NLTextureDef[] },
  File,
  { state: AppState }
>(`${sliceName}/loadStageTextureFile`, (file: File, { getState }) => {
  const state = getState();
  const { models, textureDefs } = state.stageData;

  if (!state.stageData.hasLoadedStagePolygonFile) {
    return Promise.resolve({ models, textureDefs });
  }

  return processStageTextureFile(file, models, textureDefs);
});

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

    builder.addCase(HYDRATE, (state, { payload }: AnyAction) =>
      Object.assign(state, payload)
    );

    builder.addCase(
      loadStageTextureFile.fulfilled,
      (state: StageDataState, { payload }) => {
        state.models = payload.models;
      }
    );
  }
});

export default stageDataSlice;
