import { AnyAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { loadPolygonFile } from './modelDataSlice';
import { AppState } from './store';

export interface ObjectViewerState {
  modelIndex: number;
  textureIndex: number;
  objectKey?: string;
  objectSelectionType: 'mesh' | 'polygon';
  meshDisplayMode: 'wireframe' | 'textured';
}

export const initialObjectViewerState: ObjectViewerState = {
  modelIndex: -1,
  textureIndex: -1,
  objectKey: undefined,
  objectSelectionType: 'mesh',
  meshDisplayMode: 'textured'
};

const sliceName = 'objectViewer';

/**
 * @TODO: based on model or texture edit mode,
 * edit the appropriate variable so that we can
 * keep persistent state if switching between files
 */
export const setObjectViewedIndex = createAsyncThunk<
  void,
  number,
  { state: AppState }
>(
  `${sliceName}/setObjectViewedIndexInterface`,
  async (nextIndex: number, { dispatch, getState }) => {
    let objectIndex = Math.max(0, nextIndex);

    const objectCount = (getState() as AppState).modelData.models.length;
    objectIndex = Math.min(objectIndex, objectCount - 1);

    const { actions } = objectViewerSlice;
    dispatch(actions.setObjectViewedIndex(objectIndex));
  }
);

export const navToNextObject = createAsyncThunk<
  void,
  undefined,
  { state: AppState }
>(`${sliceName}/navToNextObject`, async (_, { dispatch, getState }) => {
  const state = getState();
  const objectCount = state.modelData.models.length;
  const objectIndex = Math.min(state.objectViewer.modelIndex + 1, objectCount - 1);

  const { actions } = objectViewerSlice;
  dispatch(actions.setObjectViewedIndex(objectIndex));
});

export const navToPrevObject = createAsyncThunk<
  void,
  undefined,
  { state: AppState }
>(`${sliceName}/navToPrevObject`, async (_, { dispatch, getState }) => {
  const state = getState();
  const modelIndex = Math.max(state.objectViewer.modelIndex - 1, 0);

  const { actions } = objectViewerSlice;
  dispatch(actions.setObjectViewedIndex(modelIndex));
});

const objectViewerSlice = createSlice({
  name: 'objectViewer',
  initialState: initialObjectViewerState,
  reducers: {
    setObjectViewedIndex(state, { payload: objectIndex }: { payload: number }) {
      Object.assign(state, {
        modelIndex: objectIndex,
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
    builder.addCase(loadPolygonFile.fulfilled, (state) => {
      Object.assign(state, {
        modelIndex: 0,
        objectKey: undefined
      });
    });
  }
});

export const { setObjectKey, setObjectType } = objectViewerSlice.actions;

export default objectViewerSlice;
