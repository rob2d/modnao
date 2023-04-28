import { createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

export interface ModelViewerState {
  modelViewedIndex: number;
  objectIndex: number;
  objectSelectionType: 'mesh'; // @TODO: enumerate other types
}

export const initialState: ModelViewerState = {
  modelViewedIndex: 0,
  objectIndex: -1,
  objectSelectionType: 'mesh'
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

    setObjectType(state, { payload: { objectSelectionType } }) {
      Object.assign(state, { objectIndex: -1, objectSelectionType });
    }
  },
  extraReducers: (builder) => {
    builder.addCase(
      HYDRATE,
      (state, { payload: { modelViewerSlice } }: any) => {
        Object.assign(state, modelViewerSlice);
      }
    );
  }
});

export const { setModelViewedIndex } = modelViewerSlice.actions;
