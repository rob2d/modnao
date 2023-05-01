import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

export type NLVertex = {
  position: [x: number, y: number, z: number];
};

export type NLMesh = {
  polygons: NLPolygon[];
};

export type NLPolygon = {
  vertexes: NLVertex[];
  vertexGroupMode: string;
};

export type NLStageModel = {
  meshes: NLMesh[];
};

export interface StageDataState {
  models: NLStageModel[];
}

export const initialState: StageDataState = { models: [] };

export const loadStage = createAsyncThunk<{ models: NLStageModel[] }>(
  'stageData/loadProcessedStage',
  async () => JSON.parse(await (await fetch('/api/sample-stage')).json())
);

const stageDataSlice = createSlice({
  name: 'stageData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      loadStage.fulfilled,
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
