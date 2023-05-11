import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import processStagePolygonFile from './stage-data/processStagePolygonFile';
import processStageTextureFile from './stage-data/processStageTextureFile';
import { AppState } from './store';

export interface StageDataState {
  models: NLModel[];
  hasLoadedStagePolygonFile: boolean;
}

const sliceName = 'stageData';

export const initialStageDataState: StageDataState = {
  models: [],
  hasLoadedStagePolygonFile: false
};

export const loadStagePolygonFile = createAsyncThunk<
  { models: NLModel[] },
  File
>(`${sliceName}/loadStagePolygonFile`, processStagePolygonFile);

export const loadStageTextureFile = createAsyncThunk<
  { models: NLModel[] },
  File,
  { state: AppState }
>(`${sliceName}/loadStageTextureFile`, (file: File, { getState }) => {
  const state = getState();
  const models = state.stageData.models;

  if (!state.stageData.hasLoadedStagePolygonFile) {
    return Promise.resolve({ models });
  }

  return processStageTextureFile(file, models);
});

const stageDataSlice = createSlice({
  name: sliceName,
  initialState: initialStageDataState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      loadStagePolygonFile.fulfilled,
      (state: StageDataState, { payload }) => {
        state.models = payload.models;
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
