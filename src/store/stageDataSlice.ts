import { createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

/** @TODO: flesh this out based on sample output */
export type StageModel = { meshes: object[] };

export interface StageDataState {
  models: StageModel[];
}

export const initialState: StageDataState = { models: [] };

export const stageDataSlice = createSlice({
  name: 'stageData',
  initialState,

  // @TODO: design interface/data-flow more concretely;
  // + this should be async/thunk; look into approaches
  // w redux-toolkit
  reducers: {
    loadStage(
      state,
      { payload: { models } }: { payload: { models: StageModel[] } }
    ) {
      state.models = models;
    }
  },
  extraReducers: {
    // @TODO: createSlice wrapper to reduce
    // boilerplate with this nextSSR req in every
    // slice
    [HYDRATE]: (state, { payload: { stageData } }) => {
      return { ...state, ...stageData };
    }
  }
});
