import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import extractStageFile from './stage-data/extractStageFile';

// TODO: create namespace for all types
// that should be reasonably global in
// app e.g. NLModel types

export type TextureWrappingFlags = {
  hFlip: boolean;
  vFlip: boolean;
  hRepeat: boolean;
  vRepeat: boolean;
  hStretch: boolean;
};

export type NLVertex = {
  position: [x: number, y: number, z: number];
  normals: [x: number, y: number, z: number];
  address: number;
  contentModeValue: number;
  contentMode: 'a' | 'b';
  vertexOffset: number;
  contentAddress: number;
  uv: [u: number, v: number];
};

export type NLMesh = {
  polygons: NLPolygon[];
  position: [number, number, number];
  color: [number, number, number];
  alpha: number;
  specularLightValue: number;
  polygonDataLength: number;
  textureWrappingValue: number;
  textureWrappingFlags: TextureWrappingFlags;
  textureControlValue: number; // @TODO: enumerate possible values
  textureColorFormat: number; // @TODO enumerate possible values
  textureNumber: number;
};

export type NLPolygon = {
  address: number;
  vertexes: NLVertex[];
  vertexCount: number;
  vertexGroupModeValue: number;
  vertexGroupMode: string;
};

export type NLStageModel = {
  meshes: NLMesh[];
};

export interface StageDataState {
  models: NLStageModel[];
}

const sliceName = 'stageData';

export const initialStageDataState: StageDataState = {
  models: []
};

export const loadStage = createAsyncThunk<{ models: NLStageModel[] }, File>(
  `${sliceName}/loadStage`,
  extractStageFile
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
    builder.addCase(HYDRATE, (state, { payload }: AnyAction) =>
      Object.assign(state, payload)
    );
  }
});

export default stageDataSlice;
