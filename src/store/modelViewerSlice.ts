import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { loadStage } from './stageDataSlice';
import { AppState } from './store';

export interface ModelViewerState {
  modelViewedIndex: number;
  objectIndex: number;
  objectSelectionType: 'mesh' | 'polygon';
}

export const initialModelViewerState: ModelViewerState = {
  modelViewedIndex: 0,
  objectIndex: -1,
  objectSelectionType: 'mesh'
};

const sliceName = 'modelViewer';

/**
 * interfacing action for actual setModelViewedIndex
 * for toolkit thunk api access
 */
export const setModelViewedIndex = createAsyncThunk(
  `${sliceName}/setModelViewedIndexInterface`,
  async (nextIndex: number, { dispatch, getState }) => {
    let modelViewedIndex = Math.max(0, nextIndex);
    const modelCount = (getState() as AppState).stageData.models.length;
    modelViewedIndex = Math.min(modelViewedIndex, modelCount - 1);

    const { actions } = modelViewerSlice;
    dispatch(actions.setModelViewedIndex(modelViewedIndex));
  }
);

const modelViewerSlice = createSlice({
  name: 'modelViewer',
  initialState: initialModelViewerState,
  reducers: {
    setModelViewedIndex(state, { payload: nextIndex }) {
      state.modelViewedIndex = nextIndex;
    },

    setObjectIndex(state, { payload: { objectIndex } }) {
      Object.assign(state, { objectIndex });
    },

    setObjectType(state, { payload: { objectSelectionType } }) {
      Object.assign(state, { objectIndex: -1, objectSelectionType });
    }
  },
  extraReducers: (builder) => {
    builder.addCase(HYDRATE, (state, { payload }: AnyAction) =>
      Object.assign(state, payload)
    );
    builder.addCase(loadStage.fulfilled, (state) => {
      state.objectIndex = -1;
      state.modelViewedIndex = 0;
    });
  }
});

export const { setObjectIndex, setObjectType } = modelViewerSlice.actions;

export default modelViewerSlice;
