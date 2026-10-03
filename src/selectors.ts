import { $dialogs } from '@/modules/dialogs/dialogsStore';
import {
  $editedTextures,
  $exportTextureFileState,
  $models,
  $polygonBufferKey,
  $polygonFileName,
  $resourceAttribs,
  $textureDefs,
  $textureFileName,
  $textureHistory
} from '@/modules/model-data/modelDataStore';
import {
  $meshSelectionType,
  $modelIndex,
  $selectedObjectIds,
  $textureIndex
} from '@/modules/object-viewer/objectViewerStore';
import { $replaceTexture } from '@/modules/replace-texture/replaceTextureStore';
import type { NLUITextureDef } from '@/types';
import { computed } from '@preact-signals/safe-react';
import type { SelectedVertexGradientInputs } from './modules/model-data/modelDataTypes';

// selects the key of the currently selected object
// NOTE: this is temporary as it is a bridge to single-select
// before multi-select UX mechanisms exist
export const $objectKey = computed(() => {
  const selectedIds = $selectedObjectIds.value;
  for (const objectKey in selectedIds) {
    if (selectedIds[objectKey]) {
      return objectKey;
    }
  }

  return undefined;
});

export const $hasLoadedPolygonFile = computed(() =>
  Boolean($polygonFileName.value)
);
export const $hasLoadedTextureFile = computed(() =>
  Boolean($textureFileName.value)
);

export const $modelCount = computed(() => {
  const models = $models.value;
  return models.length;
});

export const $realModelIndexes = computed(() => {
  const models = $models.value;
  return models.reduce<number[]>((modelIndexes, model, modelIndex) => {
    if (model.meshes.length > 0) {
      modelIndexes.push(modelIndex);
    }

    return modelIndexes;
  }, []);
});

export const $realModelIndexLookup = computed(() => {
  const modelIndexes = $realModelIndexes.value;
  return modelIndexes.reduce<
    Map<
      number,
      {
        previousIndex: number;
        nextIndex: number;
      }
    >
  >((realModelIndexLookup, modelIndex, realIndex) => {
    const previousIndex =
      modelIndexes[(realIndex - 1 + modelIndexes.length) % modelIndexes.length];
    const nextIndex = modelIndexes[(realIndex + 1) % modelIndexes.length];

    realModelIndexLookup.set(modelIndex, {
      previousIndex,
      nextIndex
    });

    return realModelIndexLookup;
  }, new Map());
});
/**
 * get a set of base texture urls (before hsl edits)
 * to detect presence in O(1)
 */
export const $uneditedTextureUrls = computed(() => {
  const defs = $textureDefs.value;
  const history = $textureHistory.value;
  const urlSet = new Set<string>();
  defs.forEach((d) => {
    if (d.bufferKeys.translucent) {
      urlSet.add(d.bufferKeys.translucent);
    }

    if (d.bufferKeys.opaque) {
      urlSet.add(d.bufferKeys.opaque);
    }
  });

  Object.keys(history).forEach((k) => {
    history[Number(k)].forEach(({ bufferKeys: { opaque, translucent } }) => {
      if (opaque) {
        urlSet.add(opaque);
      }
      if (translucent) {
        urlSet.add(translucent);
      }
    });
  });

  return urlSet;
});

/**
 * combines texture defs with any edited data urls
 * to display on scene in real-time
 */
export const $updatedTextureDefs = computed(() => {
  const textureDefs = $textureDefs.value;
  const bufferKeyEntriesEntries = $editedTextures.value;
  const returnTextures = [...textureDefs];
  Object.entries(bufferKeyEntriesEntries).forEach(([index, { bufferKeys }]) => {
    const i = Number.parseInt(index);
    const entry = { ...returnTextures[i] } as NLUITextureDef;
    entry.bufferKeys = {
      ...entry.bufferKeys,
      ...bufferKeys
    };

    returnTextures[i] = entry;
  });

  return returnTextures;
});

export const $model = computed(() => {
  const modelIndex = $modelIndex.value;
  const models = $models.value;
  return models?.[modelIndex];
});

const EMPTY_SELECTED_VERTEX_GRADIENT_INPUTS: SelectedVertexGradientInputs = {
  selectedVertices: [],
  bounds: undefined
};

const createSelectedVertexGradientInputsSelector = () => {
  let cachedSelectionKey = '';
  let cachedInputs = EMPTY_SELECTED_VERTEX_GRADIENT_INPUTS;
  return computed(() => {
    const selectedIds = $selectedObjectIds.value;
    const model = $model.value;
    const modelIndex = $modelIndex.value;
    const polygonBufferKey = $polygonBufferKey.value;
    const selectedVertexKeys = Object.keys(selectedIds)
      .filter((objectKey) => selectedIds[objectKey])
      .sort();
    const selectionKey = `${polygonBufferKey ?? ''}|${modelIndex}|${selectedVertexKeys.join('|')}`;

    if (selectionKey === cachedSelectionKey) {
      return cachedInputs;
    }

    if (!model || selectedVertexKeys.length === 0) {
      cachedSelectionKey = selectionKey;
      cachedInputs = EMPTY_SELECTED_VERTEX_GRADIENT_INPUTS;

      return cachedInputs;
    }

    const selectedVertices = selectedVertexKeys.flatMap((objectKey) => {
      const indexes = objectKey.split('_').map(Number);

      if (indexes.length !== 3 || !indexes.every(Number.isInteger)) {
        return [];
      }

      const [meshIndex, polygonIndex, vertexIndex] = indexes;
      const mesh = model.meshes[meshIndex];

      if (!mesh?.hasColoredVertices) {
        return [];
      }

      const vertex = mesh.polygons[polygonIndex]?.vertices[vertexIndex];

      if (!vertex?.colors) {
        return [];
      }

      return [
        {
          contentAddress: vertex.contentAddress,
          position: vertex.position,
          alpha: vertex.colors[3]
        }
      ];
    });

    if (selectedVertices.length === 0) {
      cachedSelectionKey = selectionKey;
      cachedInputs = EMPTY_SELECTED_VERTEX_GRADIENT_INPUTS;

      return cachedInputs;
    }

    const min: Point3D = [Infinity, Infinity, Infinity];
    const max: Point3D = [-Infinity, -Infinity, -Infinity];

    selectedVertices.forEach(({ position }) => {
      position.forEach((coordinate, index) => {
        min[index] = Math.min(min[index], coordinate);
        max[index] = Math.max(max[index], coordinate);
      });
    });

    cachedSelectionKey = selectionKey;
    cachedInputs = {
      selectedVertices,
      bounds: {
        min,
        max,
        center: min.map(
          (coordinate, index) => coordinate + (max[index] - coordinate) / 2
        ) as Point3D,
        size: min.map(
          (coordinate, index) => max[index] - coordinate
        ) as Point3D,
        vertexCount: selectedVertices.length
      }
    };

    return cachedInputs;
  });
};

export const $selectedVertexGradientInputs =
  createSelectedVertexGradientInputsSelector();

export type DisplayedMesh = NLMesh & {
  textureHash: string;
};

const getDisplayedMeshes = (model: NLModel, textureDefs: NLUITextureDef[]) =>
  (model?.meshes || []).reduce<DisplayedMesh[]>((meshes, m) => {
    const tDef = textureDefs[m.textureIndex];
    if (!tDef) {
      meshes.push({ ...m, textureHash: '' });
      return meshes;
    }

    const url = tDef.bufferKeys[m.isOpaque ? 'opaque' : 'translucent'];
    const { hRepeat, vRepeat } = m.textureWrappingFlags;
    const textureHash = `${url}-${hRepeat ? 1 : 0}-${vRepeat ? 1 : 0}`;

    meshes.push({ ...m, textureHash });
    return meshes;
  }, []);

export const $displayedMeshes = computed(() => {
  const model = $model.value;
  const textureDefs = $updatedTextureDefs.value;
  return getDisplayedMeshes(model, textureDefs);
});

export const $allDisplayedMeshes = computed(() => {
  const models = $models.value;
  const textureDef = $updatedTextureDefs.value;
  return models.map((model) => getDisplayedMeshes(model, textureDef));
});

/** infers mesh selection from selected object key */
export const $objectMeshIndex = computed(() => {
  const objectKey = $objectKey.value;
  return !objectKey ? -1 : Number(objectKey.split('_')[0]);
});

/** infers mesh selection from selected object key */
export const $objectPolygonIndex = computed(() => {
  const objectKey = $objectKey.value;
  const type = $meshSelectionType.value;
  if (type === 'mesh' || !objectKey) {
    return -1;
  }
  return Number(objectKey.split('_')[1]);
});

export const $mesh = computed(() => {
  const model = $model.value;
  const meshIndex = $objectMeshIndex.value;
  return model?.meshes[meshIndex] || undefined;
});

export const $replacementImage = computed(
  () => $replaceTexture.value.replacementImage
);

export const $replacementTextureIndex = computed(
  () => $replaceTexture.value.textureIndex
);

export const $isAppInfoDialogShown = computed(
  () => $dialogs.value.dialogShown === 'app-info'
);

export const $isFileSupportDialogShown = computed(
  () => $dialogs.value.dialogShown === 'file-support-info'
);

export const $canExportTextures = computed(() => {
  const textureFileName = $textureFileName.value;
  const resourceAttribs = $resourceAttribs.value;
  return (
    Boolean(textureFileName) && resourceAttribs?.resourceType !== 'cvs2-menu'
  );
});

export const $contentViewMode = computed(() => {
  const hasLoadedTextures = $hasLoadedTextureFile.value;
  const hasLoadedPolygons = $hasLoadedPolygonFile.value;
  if (hasLoadedTextures && !hasLoadedPolygons) {
    return 'textures';
  } else if (hasLoadedPolygons) {
    return 'polygons';
  } else {
    return 'welcome';
  }
});

export const $selectedTexture = computed(() => {
  const contentViewMode = $contentViewMode.value;
  const selectedObjectIds = $selectedObjectIds.value;
  const textureIndex = $textureIndex.value;
  switch (contentViewMode) {
    case 'textures': {
      return textureIndex;
    }
    case 'polygons': {
      for (const objectKey in selectedObjectIds) {
        if (selectedObjectIds[objectKey]) {
          return textureIndex;
        }
      }

      return -1;
    }
    default:
    case 'welcome': {
      return -1;
    }
  }
});

export const $objectIndex = computed(() => {
  const viewMode = $contentViewMode.value;
  const modelIndex = $modelIndex.value;
  const textureIndex = $textureIndex.value;
  switch (viewMode) {
    case 'polygons':
      return modelIndex;
    case 'textures':
      return textureIndex;
    default:
      return -1;
  }
});

export const $objectCount = computed(() => {
  const viewMode = $contentViewMode.value;
  const models = $models.value;
  const textureDefs = $textureDefs.value;
  switch (viewMode) {
    case 'polygons':
      return models.length;
    case 'textures':
      return textureDefs.length;
    default:
      return 0;
  }
});

export const $canNavObjects = computed(() => {
  const viewMode = $contentViewMode.value;
  const objectCount = $objectCount.value;
  const realModelIndexes = $realModelIndexes.value;
  switch (viewMode) {
    case 'polygons':
      return realModelIndexes.length > 1;
    case 'textures':
      return objectCount > 1;
    default:
      return false;
  }
});

export const $processingOverlayShown = computed(
  () => $exportTextureFileState.value === 'pending'
);
