import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { loadStagePolygonFile } from './stageDataSlice';
import { AppState } from './store';

export interface ModelViewerState {
  modelIndex: number;
  objectIndex: number;
  objectSelectionType: 'mesh' | 'polygon';
}

export const initialModelViewerState: ModelViewerState = {
  modelIndex: 0,
  objectIndex: -1,
  objectSelectionType: 'mesh'
};

const sliceName = 'modelViewer';

/**
 * interfacing action for actual setModelViewedIndex
 * for toolkit thunk api access
 */
export const setModelViewedIndex = createAsyncThunk<void, number>(
  `${sliceName}/setModelViewedIndexInterface`,
  async (nextIndex: number, { dispatch, getState }) => {
    let modelIndex = Math.max(0, nextIndex);
    const modelCount = (getState() as AppState).stageData.models.length;
    modelIndex = Math.min(modelIndex, modelCount - 1);

    const { actions } = modelViewerSlice;
    dispatch(actions.setModelViewedIndex(modelIndex));
  }
);

const modelViewerSlice = createSlice({
  name: 'modelViewer',
  initialState: initialModelViewerState,
  reducers: {
    setModelViewedIndex(state, { payload: modelIndex }: { payload: number }) {
      Object.assign(state, {
        modelIndex,
        objectIndex: -1
      });
    },

    setObjectIndex(state, { payload: objectIndex }) {
      Object.assign(state, { objectIndex });
    },

    setObjectType(state, { payload: { objectSelectionType } }) {
      Object.assign(state, {
        objectIndex: -1,
        objectSelectionType
      });
    }
  },
  extraReducers: (builder) => {
    builder.addCase(HYDRATE, (state, { payload }: AnyAction) =>
      Object.assign(state, payload)
    );
    builder.addCase(loadStagePolygonFile.fulfilled, (state) => {
      Object.assign(state, {
        modelIndex: 0,
        objectIndex: -1
      });
    });
  }
});

export const { setObjectIndex, setObjectType } = modelViewerSlice.actions;

export default modelViewerSlice;
