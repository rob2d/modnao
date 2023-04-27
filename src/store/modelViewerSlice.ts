import { createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

export interface ModelViewerState {
  modelViewedIndex: number;
  objectIndex: number;
  objectGroupType: 'mesh'; // @TODO: enumerate other types
}

export const initialState: ModelViewerState = {
  modelViewedIndex: 0,
  objectIndex: -1,
  objectGroupType: 'mesh'
};

export const modelViewerSlice = createSlice({
  name: 'modelViewer',
  initialState,
  reducers: {
    setModelViewedIndex(state, { payload: { nextIndex, models } }) {
      const modelViewedIndex = Math.max(0, nextIndex);
      state.modelViewedIndex = Math.min(modelViewedIndex, models.length - 1);
    },

    setObjectIndex(state, { payload: { objectIndex } }) {
      Object.assign(state, { objectIndex });
    },

    setObjectType(state, { payload: { objectGroupType } }) {
      Object.assign(state, { objectIndex: -1, objectGroupType });
    }
  },
  extraReducers: {
    // @TODO: createSlice wrapper to reduce
    // boilerplate with this nextSSR req in every
    // slice
    [HYDRATE]: (state, { payload: { modelViewer } }) => {
      return { ...state, ...modelViewer };
    }
  }
});

export const { setModelViewedIndex } = modelViewerSlice.actions;
