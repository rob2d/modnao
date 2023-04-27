import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

/** @TODO: flesh this out based on sample output */
export type StageModel = { meshes: object[] };

export interface StageDataState {
  models: StageModel[];
}

export const initialState: StageDataState = { models: [] };

const loadStage = createAsyncThunk<{ models: StageModel[] }>(
  'stageData/loadProcessedStage',
  async () => {
    return await (await fetch('/api/sample-stage')).json();
  }
);

export const stageDataSlice = createSlice({
  name: 'stageData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      loadStage.fulfilled,
      (state: StageDataState, { payload: { models } }) => {
        state.models = models;
      }
    );
    builder.addCase(HYDRATE, (state, { payload: { stageData } }: any) => {
      Object.assign(state, stageData);
    });
  }
});
