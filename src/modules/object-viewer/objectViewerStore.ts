import {
  $contentViewMode,
  $realModelIndexes,
  $realModelIndexLookup
} from '@/selectors';
import { getState } from '@/store';
import { signal } from '@preact-signals/safe-react';
import { produce } from 'immer';
import getConvertedObjectKeys from './objectSelectionConversion';
import type { NodeSelectionMergeMode } from '@/types';

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

export const setObjectViewedIndex = async (objectIndex: number) => {
  const indexKey =
    $contentViewMode.value === 'polygons' ? 'modelIndex' : 'textureIndex';
  $objectViewer.value = {
    ...$objectViewer.value,
    [indexKey]: objectIndex,
    selectedIds: {}
  };
  return { objectIndex, indexKey };
};

export const navToPrevObject = async () => {
  try {
    const state = getState();
    const contentViewMode = $contentViewMode.value;
    const indexKey =
      contentViewMode === 'polygons' ? 'modelIndex' : 'textureIndex';
    const objectsKey =
      contentViewMode === 'polygons' ? 'models' : 'textureDefs';
    const objectCount = state.modelData[objectsKey].length;
    const index = state.objectViewer[indexKey];
    const realModelIndexLookup = $realModelIndexLookup.value;
    const realModelIndexes = $realModelIndexes.value;
    const objectIndex =
      contentViewMode === 'polygons'
        ? (realModelIndexLookup.get(index)?.previousIndex ??
          getPrevRealModelIndex(index, realModelIndexes))
        : getPrevObjectIndex(index, objectCount);

    setObjectViewedIndex(objectIndex);
  } catch {
    return undefined;
  }
};

export const navToNextObject = async () => {
  try {
    const state = getState();
    const contentViewMode = $contentViewMode.value;
    const indexKey =
      contentViewMode === 'polygons' ? 'modelIndex' : 'textureIndex';
    const objectsKey =
      contentViewMode === 'polygons' ? 'models' : 'textureDefs';
    const objectCount = state.modelData[objectsKey].length;
    const index = state.objectViewer[indexKey];
    const realModelIndexLookup = $realModelIndexLookup.value;
    const realModelIndexes = $realModelIndexes.value;
    const objectIndex =
      contentViewMode === 'polygons'
        ? (realModelIndexLookup.get(index)?.nextIndex ??
          getNextRealModelIndex(index, realModelIndexes))
        : getNextObjectIndex(index, objectCount);

    setObjectViewedIndex(objectIndex);
  } catch {
    return undefined;
  }
};

export const selectObjectKeys = ({
  objectKeys,
  selectionMergeMode
}: {
  objectKeys: string[];
  selectionMergeMode: NodeSelectionMergeMode;
}) => {
  if (selectionMergeMode === 'remove') {
    removeObjectKeys(objectKeys);
  } else if (selectionMergeMode === 'add') {
    addObjectKeys(objectKeys);
  } else {
    setObjectKeys(objectKeys);
  }
};

export const $objectViewer = signal<ObjectViewerState>(
  initialObjectViewerState
);

export function addObjectKeys(objectKeys: string[]) {
  $objectViewer.value = produce($objectViewer.value, (state) => {
    objectKeys.forEach((objectKey) => {
      state.selectedIds[objectKey] = true;
    });
  });
}

export function removeObjectKeys(objectKeys: string[]) {
  $objectViewer.value = produce($objectViewer.value, (state) => {
    objectKeys.forEach((objectKey) => {
      delete state.selectedIds[objectKey];
    });
  });
}

export function setObjectKeys(objectKeys: string[]) {
  $objectViewer.value = produce($objectViewer.value, (state) => {
    const selectedIds = objectKeys.reduce<Record<string, true>>(
      (selectedObjectIds, objectKey) => {
        selectedObjectIds[objectKey] = true;
        return selectedObjectIds;
      },
      {}
    );

    Object.assign(state, {
      selectedIds
    });
  });
}

export function setSelectedTextureIndex(payload: number) {
  $objectViewer.value = produce($objectViewer.value, (state) => {
    Object.assign(state, {
      textureIndex: payload
    });
  });
}

export function setObjectType(meshSelectionType: MeshSelectionType) {
  const previousState = getState();
  const previousType = previousState.objectViewer.meshSelectionType;
  const selectedKeys = Object.keys(previousState.objectViewer.selectedIds);
  const selectedIds =
    previousType === meshSelectionType
      ? {}
      : Object.fromEntries(
          getConvertedObjectKeys(
            previousState,
            selectedKeys,
            previousType,
            meshSelectionType
          ).map((key) => [key, true])
        );
  $objectViewer.value = produce($objectViewer.value, (state) => {
    Object.assign(state, {
      selectedIds,
      meshSelectionType
    });
  });
}

export function navToTextureModelUsage(payload: {
  modelIndex: number;
  meshIndexes: number[];
  textureIndex?: number;
}) {
  $objectViewer.value = produce($objectViewer.value, (state) => {
    const selectedIds = payload.meshIndexes.reduce<Record<string, true>>(
      (selectedMeshIds, meshIndex) => {
        selectedMeshIds[`${meshIndex}`] = true;
        return selectedMeshIds;
      },
      {}
    );

    Object.assign(state, {
      modelIndex: payload.modelIndex,
      textureIndex: payload.textureIndex ?? state.textureIndex,
      selectedIds,
      meshSelectionType: 'mesh'
    });
  });
}
