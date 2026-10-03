import { batch, observable } from '@legendapp/state';
import type { NodeSelectionMergeMode } from '@/types';

export type MeshSelectionType = 'mesh' | 'polygon' | 'vertex';

export const $modelIndex = observable(-1);
export const $textureIndex = observable(-1);
export const $selectedObjectIds = observable<Record<string, true>>({});
export const $meshSelectionType = observable<MeshSelectionType>('mesh');
export const $meshDisplayMode = observable<'wireframe' | 'textured'>(
  'textured'
);

export function resetObjectViewer() {
  batch(() => {
    $modelIndex.set(-1);
    $textureIndex.set(-1);
    $selectedObjectIds.set({});
    $meshSelectionType.set('mesh');
    $meshDisplayMode.set('textured');
  });
}

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
  if (objectKeys.every((objectKey) => $selectedObjectIds.get()[objectKey])) {
    return;
  }

  const selectedIds = { ...$selectedObjectIds.get() };

  objectKeys.forEach((objectKey) => {
    selectedIds[objectKey] = true;
  });

  $selectedObjectIds.set(selectedIds);
}

export function removeObjectKeys(objectKeys: string[]) {
  if (!objectKeys.some((objectKey) => $selectedObjectIds.get()[objectKey])) {
    return;
  }

  const selectedIds = { ...$selectedObjectIds.get() };

  objectKeys.forEach((objectKey) => {
    delete selectedIds[objectKey];
  });

  $selectedObjectIds.set(selectedIds);
}

export function setObjectKeys(objectKeys: string[]) {
  $selectedObjectIds.set(
    objectKeys.reduce<Record<string, true>>((selectedObjectIds, objectKey) => {
      selectedObjectIds[objectKey] = true;
      return selectedObjectIds;
    }, {})
  );
}

export function setSelectedTextureIndex(payload: number) {
  $textureIndex.set(payload);
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
    $modelIndex.set(payload.modelIndex);
    $textureIndex.set(payload.textureIndex ?? $textureIndex.get());
    $selectedObjectIds.set(selectedIds);
    $meshSelectionType.set('mesh');
  });
}
