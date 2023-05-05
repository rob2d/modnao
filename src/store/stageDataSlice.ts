import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import processStageFile from './stage-data/processStageFile';

export interface StageDataState {
  models: NLModel[];
}

const sliceName = 'stageData';

export const initialStageDataState: StageDataState = {
  models: []
};

export const loadStage = createAsyncThunk<{ models: NLModel[] }, File>(
  `${sliceName}/loadStage`,
  processStageFile
);

export const loadSampleData = createAsyncThunk<{
  models: NLModel[];
}>('stageData/loadSampleData', async () =>
  JSON.parse(await (await fetch('/api/sample-stage')).json())
);

const stageDataSlice = createSlice({
  name: 'stageData',
  initialState: initialStageDataState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      loadStage.fulfilled,
      (state: StageDataState, { payload }) => {
        state.models = payload.models;
      }
    );
    builder.addCase(
      loadSampleData.fulfilled,
      (state: StageDataState, { payload }) => {
        state.models = payload.models;
      }
    );
    builder.addCase(HYDRATE, (state, { payload }: AnyAction) =>
      Object.assign(state, payload)
    );
  }
});

export default stageDataSlice;
