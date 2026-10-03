import { $models, $textureDefs } from '@/modules/model-data/modelDataStore';
import {
  $contentViewMode,
  $model,
  $realModelIndexes,
  $realModelIndexLookup
} from '@/derivedState';
import { batch, signal } from '@preact-signals/safe-react';
import getConvertedObjectKeys from './objectSelectionConversion';
import type { NodeSelectionMergeMode } from '@/types';

export type MeshSelectionType = 'mesh' | 'polygon' | 'vertex';

export const $modelIndex = signal(-1);
export const $textureIndex = signal(-1);
export const $selectedObjectIds = signal<Record<string, true>>({});
export const $meshSelectionType = signal<MeshSelectionType>('mesh');
export const $meshDisplayMode = signal<'wireframe' | 'textured'>('textured');

export function resetObjectViewer() {
  batch(() => {
    $modelIndex.value = -1;
    $textureIndex.value = -1;
    $selectedObjectIds.value = {};
    $meshSelectionType.value = 'mesh';
    $meshDisplayMode.value = 'textured';
  });
}

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
  batch(() => {
    if (indexKey === 'modelIndex') {
      $modelIndex.value = objectIndex;
    } else {
      $textureIndex.value = objectIndex;
    }

    $selectedObjectIds.value = {};
  });

  return { objectIndex, indexKey };
};

export const navToPrevObject = async () => {
  try {
    const contentViewMode = $contentViewMode.value;
    const objectCount =
      contentViewMode === 'polygons'
        ? $models.value.length
        : $textureDefs.value.length;
    const index =
      contentViewMode === 'polygons' ? $modelIndex.value : $textureIndex.value;
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
    const contentViewMode = $contentViewMode.value;
    const objectCount =
      contentViewMode === 'polygons'
        ? $models.value.length
        : $textureDefs.value.length;
    const index =
      contentViewMode === 'polygons' ? $modelIndex.value : $textureIndex.value;
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

export function addObjectKeys(objectKeys: string[]) {
  if (objectKeys.every((objectKey) => $selectedObjectIds.value[objectKey])) {
    return;
  }

  const selectedIds = { ...$selectedObjectIds.value };

  objectKeys.forEach((objectKey) => {
    selectedIds[objectKey] = true;
  });

  $selectedObjectIds.value = selectedIds;
}

export function removeObjectKeys(objectKeys: string[]) {
  if (!objectKeys.some((objectKey) => $selectedObjectIds.value[objectKey])) {
    return;
  }

  const selectedIds = { ...$selectedObjectIds.value };

  objectKeys.forEach((objectKey) => {
    delete selectedIds[objectKey];
  });

  $selectedObjectIds.value = selectedIds;
}

export function setObjectKeys(objectKeys: string[]) {
  $selectedObjectIds.value = objectKeys.reduce<Record<string, true>>(
    (selectedObjectIds, objectKey) => {
      selectedObjectIds[objectKey] = true;
      return selectedObjectIds;
    },
    {}
  );
}

export function setSelectedTextureIndex(payload: number) {
  $textureIndex.value = payload;
}

export function setObjectType(meshSelectionType: MeshSelectionType) {
  const previousType = $meshSelectionType.value;
  const selectedKeys = Object.keys($selectedObjectIds.value);
  const selectedIds: Record<string, true> =
    previousType === meshSelectionType
      ? {}
      : Object.fromEntries(
          getConvertedObjectKeys(
            $model.value,
            selectedKeys,
            previousType,
            meshSelectionType
          ).map((key) => [key, true])
        );

  batch(() => {
    $selectedObjectIds.value = selectedIds;
    $meshSelectionType.value = meshSelectionType;
  });
}

export function navToTextureModelUsage(payload: {
  modelIndex: number;
  meshIndexes: number[];
  textureIndex?: number;
}) {
  const selectedIds = payload.meshIndexes.reduce<Record<string, true>>(
    (selectedMeshIds, meshIndex) => {
      selectedMeshIds[`${meshIndex}`] = true;
      return selectedMeshIds;
    },
    {}
  );

  batch(() => {
    $modelIndex.value = payload.modelIndex;
    $textureIndex.value = payload.textureIndex ?? $textureIndex.value;
    $selectedObjectIds.value = selectedIds;
    $meshSelectionType.value = 'mesh';
  });
}
