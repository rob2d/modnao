import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { loadStagePolygonFile } from './stageDataSlice';
import { AppState } from './store';

export interface ModelViewerState {
  modelIndex: number;
  objectKey?: string;
  objectSelectionType: 'mesh' | 'polygon';
  meshDisplayMode: 'wireframe' | 'textured';
}

export const initialModelViewerState: ModelViewerState = {
  modelIndex: 0,
  objectKey: undefined,
  objectSelectionType: 'mesh',
  meshDisplayMode: 'textured'
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
        objectKey: undefined
      });
    },

    setObjectKey(state, { payload: objectKey }) {
      Object.assign(state, { objectKey });
    },

    setObjectType(state, { payload: objectSelectionType }) {
      Object.assign(state, {
        objectKey: undefined,
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
        objectKey: undefined
      });
    });
  }
});

export const { setObjectKey, setObjectType } = modelViewerSlice.actions;

export default modelViewerSlice;
