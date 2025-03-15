import { createSlice, UnknownAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { selectContentViewMode } from '../selectors';
import { createAppAsyncThunk } from '../storeTypings';
import { processPolygonFile } from '../modelData';

export interface ObjectViewerState {
  modelIndex: number;
  textureIndex: number;
  objectKey?: string;
  meshSelectionType: 'mesh' | 'polygon';
  meshDisplayMode: 'wireframe' | 'textured';
}

export const initialObjectViewerState: ObjectViewerState = {
  modelIndex: -1,
  textureIndex: -1,
  objectKey: undefined,
  meshSelectionType: 'mesh',
  meshDisplayMode: 'textured'
};

const sliceName = 'objectViewer';

export const setObjectViewedIndex = createAppAsyncThunk(
  `${sliceName}/setObjectViewedIndex`,
  async (objectIndex: number, { getState }) => {
    const state = getState();
    const contentViewMode = selectContentViewMode(state);
    const indexKey =
      contentViewMode === 'polygons' ? 'modelIndex' : 'textureIndex';
    return { objectIndex, indexKey };
  }
);

export const navToPrevObject = createAppAsyncThunk(
  `${sliceName}/navToPrevObject`,
  async (_, { dispatch, getState }) => {
    const state = getState();
    const contentViewMode = selectContentViewMode(state);
    const indexKey =
      contentViewMode === 'polygons' ? 'modelIndex' : 'textureIndex';
    const index = state.objectViewer[indexKey];
    const objectIndex = Math.max(index - 1, 0);

    dispatch(setObjectViewedIndex(objectIndex));
  }
);

export const navToNextObject = createAppAsyncThunk(
  `${sliceName}/navToNextObject`,
  async (_, { dispatch, getState }) => {
    const state = getState();
    const contentViewMode = selectContentViewMode(state);
    const indexKey =
      contentViewMode === 'polygons' ? 'modelIndex' : 'textureIndex';
    const objectsKey =
      contentViewMode === 'polygons' ? 'models' : 'textureDefs';
    const objectCount = state.modelData[objectsKey].length;
    const objectIndex = Math.min(
      state.objectViewer[indexKey] + 1,
      objectCount - 1
    );

    dispatch(setObjectViewedIndex(objectIndex));
  }
);

const objectViewerSlice = createSlice({
  name: 'objectViewer',
  initialState: initialObjectViewerState,
  reducers: {
    setObjectKey(state, { payload: objectKey }) {
      Object.assign(state, { objectKey });
    },

    setObjectType(state, { payload: meshSelectionType }) {
      Object.assign(state, {
        objectKey: undefined,
        meshSelectionType
      });
    }
  },
  extraReducers: (builder) => {
    builder.addCase(HYDRATE, (state, { payload }: UnknownAction) =>
      Object.assign(state, payload)
    );
    builder.addCase(processPolygonFile.fulfilled, (state) => {
      Object.assign(state, {
        modelIndex: 0,
        textureIndex: 0,
        objectKey: undefined
      });
    });

    builder.addCase(
      setObjectViewedIndex.fulfilled,
      (state, { payload: { objectIndex, indexKey } }) => {
        Object.assign(state, {
          [indexKey]: objectIndex,
          objectKey: undefined
        });
      }
    );
  }
});

export const { setObjectKey, setObjectType } = objectViewerSlice.actions;

export default objectViewerSlice;
