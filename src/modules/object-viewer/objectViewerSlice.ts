import { createSlice, UnknownAction } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import {
  selectContentViewMode,
  selectRealModelIndexes,
  selectRealModelIndexLookup
} from '@/selectors';
import { createAppAsyncThunk } from '@/storeTypings';
import { processPolygonFile } from '@/modules/model-data';

export interface ObjectViewerState {
  modelIndex: number;
  textureIndex: number;
  selectedIds: Record<string, true>;
  meshSelectionType: MeshSelectionType;
  meshDisplayMode: 'wireframe' | 'textured';
}

export type MeshSelectionType = 'mesh' | 'polygon' | 'vertex';

export const initialObjectViewerState: ObjectViewerState = {
  modelIndex: -1,
  textureIndex: -1,
  selectedIds: {},
  meshSelectionType: 'mesh',
  meshDisplayMode: 'textured'
};

const sliceName = 'objectViewer';

const getPrevRealModelIndex = (modelIndex: number, modelIndexes: number[]) => {
  for (let index = modelIndexes.length - 1; index >= 0; index -= 1) {
    if (modelIndexes[index] < modelIndex) {
      return modelIndexes[index];
    }
  }

  return modelIndexes[modelIndexes.length - 1] ?? modelIndex;
};

const getNextRealModelIndex = (modelIndex: number, modelIndexes: number[]) => {
  const nextModelIndex = modelIndexes.find(
    (realModelIndex) => realModelIndex > modelIndex
  );

  return nextModelIndex ?? modelIndexes[0] ?? modelIndex;
};

const getPrevObjectIndex = (objectIndex: number, objectCount: number) => {
  if (objectCount <= 0) {
    return -1;
  }

  return objectIndex > 0 ? objectIndex - 1 : objectCount - 1;
};

const getNextObjectIndex = (objectIndex: number, objectCount: number) => {
  if (objectCount <= 0) {
    return -1;
  }

  return objectIndex < objectCount - 1 ? objectIndex + 1 : 0;
};

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
    const objectsKey =
      contentViewMode === 'polygons' ? 'models' : 'textureDefs';
    const objectCount = state.modelData[objectsKey].length;
    const index = state.objectViewer[indexKey];
    const realModelIndexLookup = selectRealModelIndexLookup(state);
    const realModelIndexes = selectRealModelIndexes(state);
    const objectIndex =
      contentViewMode === 'polygons'
        ? (realModelIndexLookup.get(index)?.previousIndex ??
          getPrevRealModelIndex(index, realModelIndexes))
        : getPrevObjectIndex(index, objectCount);

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
    const index = state.objectViewer[indexKey];
    const realModelIndexLookup = selectRealModelIndexLookup(state);
    const realModelIndexes = selectRealModelIndexes(state);
    const objectIndex =
      contentViewMode === 'polygons'
        ? (realModelIndexLookup.get(index)?.nextIndex ??
          getNextRealModelIndex(index, realModelIndexes))
        : getNextObjectIndex(index, objectCount);

    dispatch(setObjectViewedIndex(objectIndex));
  }
);

const objectViewerSlice = createSlice({
  name: 'objectViewer',
  initialState: initialObjectViewerState,
  reducers: {
    setObjectKey(state, { payload: objectKey }) {
      Object.assign(state, {
        selectedIds: !objectKey ? {} : { [objectKey]: true }
      });
    },

    setObjectType(state, { payload: meshSelectionType }) {
      Object.assign(state, {
        selectedIds: {},
        meshSelectionType
      });
    },

    setModelMeshSelection(
      state,
      { payload }: { payload: { modelIndex: number; meshIndex: number } }
    ) {
      Object.assign(state, {
        modelIndex: payload.modelIndex,
        selectedIds: { [`${payload.meshIndex}`]: true },
        meshSelectionType: 'mesh'
      });
    }
  },
  extraReducers: (builder) => {
    builder.addCase(HYDRATE, (state, { payload }: UnknownAction) =>
      Object.assign(state, payload)
    );
    builder.addCase(processPolygonFile.fulfilled, (state, { payload }) => {
      const firstRealModelIndex = payload.models.findIndex(
        (model) => model.meshes.length > 0
      );

      Object.assign(state, {
        modelIndex: firstRealModelIndex,
        textureIndex: 0,
        selectedIds: {}
      });
    });

    builder.addCase(
      setObjectViewedIndex.fulfilled,
      (state, { payload: { objectIndex, indexKey } }) => {
        Object.assign(state, {
          [indexKey]: objectIndex,
          selectedIds: {}
        });
      }
    );
  }
});

export const { setModelMeshSelection, setObjectKey, setObjectType } =
  objectViewerSlice.actions;

export default objectViewerSlice;
