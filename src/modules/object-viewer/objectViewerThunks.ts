import { $models, $textureDefs } from '@/modules/model-data/modelDataStore';
import {
  $contentViewMode,
  $model,
  $realModelIndexes,
  $realModelIndexLookup
} from '@/derivedState';
import { batch } from '@legendapp/state';
import getConvertedObjectKeys from './objectSelectionConversion';
import {
  $meshSelectionType,
  $modelIndex,
  $selectedObjectIds,
  $textureIndex,
  type MeshSelectionType
} from './objectViewerStore';

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
    $contentViewMode.get() === 'polygons' ? 'modelIndex' : 'textureIndex';
  batch(() => {
    if (indexKey === 'modelIndex') {
      $modelIndex.set(objectIndex);
    } else {
      $textureIndex.set(objectIndex);
    }

    $selectedObjectIds.set({});
  });

  return { objectIndex, indexKey };
};

export const navToPrevObject = async () => {
  try {
    const contentViewMode = $contentViewMode.get();
    const objectCount =
      contentViewMode === 'polygons'
        ? $models.get().length
        : $textureDefs.get().length;
    const index =
      contentViewMode === 'polygons' ? $modelIndex.get() : $textureIndex.get();
    const realModelIndexLookup = $realModelIndexLookup.get();
    const realModelIndexes = $realModelIndexes.get();
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
    const contentViewMode = $contentViewMode.get();
    const objectCount =
      contentViewMode === 'polygons'
        ? $models.get().length
        : $textureDefs.get().length;
    const index =
      contentViewMode === 'polygons' ? $modelIndex.get() : $textureIndex.get();
    const realModelIndexLookup = $realModelIndexLookup.get();
    const realModelIndexes = $realModelIndexes.get();
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

export function setObjectType(meshSelectionType: MeshSelectionType) {
  const previousType = $meshSelectionType.get();
  const selectedKeys = Object.keys($selectedObjectIds.get());
  const selectedIds: Record<string, true> =
    previousType === meshSelectionType
      ? {}
      : Object.fromEntries(
          getConvertedObjectKeys(
            $model.get(),
            selectedKeys,
            previousType,
            meshSelectionType
          ).map((key) => [key, true])
        );

  batch(() => {
    $selectedObjectIds.set(selectedIds);
    $meshSelectionType.set(meshSelectionType);
  });
}
