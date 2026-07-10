import { createSelector } from '@reduxjs/toolkit';
import type { ContentViewMode, NLUITextureDef } from '@/types';
import { AppState } from './storeTypings';
import type { SelectedVertexGradientInputs } from './modules/model-data/modelDataTypes';

export const selectModelIndex = (s: AppState) => s.objectViewer.modelIndex;
export const selectTextureIndex = (s: AppState) => s.objectViewer.textureIndex;
export const selectSelectedObjectIds = (s: AppState) =>
  s.objectViewer.selectedIds;

// selects the key of the currently selected object
// NOTE: this is temporary as it is a bridge to single-select
// before multi-select UX mechanisms exist
export const selectObjectKey = createSelector(
  selectSelectedObjectIds,
  (selectedIds) => {
    for (const objectKey in selectedIds) {
      if (selectedIds[objectKey]) {
        return objectKey;
      }
    }

    return undefined;
  }
);
export const selectModels = (s: AppState) => s.modelData.models;
export const selectResourceAttribs = (s: AppState) =>
  s.modelData.resourceAttribs;

export const selectHasLoadedPolygonFile = (s: AppState) =>
  Boolean(s.modelData.polygonFileName);
export const selectHasLoadedTextureFile = (s: AppState) =>
  Boolean(s.modelData.textureFileName);
export const selectLoadTexturesState = (s: AppState) =>
  s.modelData.loadTexturesState;

export const selectHasEditedTextures = (s: AppState) =>
  s.modelData.hasEditedTextures;
export const selectModelCount = createSelector(
  selectModels,
  (models) => models.length
);

export const selectRealModelIndexes = createSelector(selectModels, (models) =>
  models.reduce<number[]>((modelIndexes, model, modelIndex) => {
    if (model.meshes.length > 0) {
      modelIndexes.push(modelIndex);
    }

    return modelIndexes;
  }, [])
);

export const selectRealModelIndexLookup = createSelector(
  selectRealModelIndexes,
  (modelIndexes) =>
    modelIndexes.reduce<
      Map<
        number,
        {
          previousIndex: number;
          nextIndex: number;
        }
      >
    >((realModelIndexLookup, modelIndex, realIndex) => {
      const previousIndex =
        modelIndexes[
          (realIndex - 1 + modelIndexes.length) % modelIndexes.length
        ];
      const nextIndex = modelIndexes[(realIndex + 1) % modelIndexes.length];

      realModelIndexLookup.set(modelIndex, {
        previousIndex,
        nextIndex
      });

      return realModelIndexLookup;
    }, new Map())
);
export const selectMeshSelectionType = (s: AppState) =>
  s.objectViewer.meshSelectionType;
export const selectTextureDefs = (s: AppState) => s.modelData.textureDefs;
export const selectTextureBufferKeyHistory = (s: AppState) =>
  s.modelData.textureHistory;

/**
 * get a set of base texture urls (before hsl edits)
 * to detect presence in O(1)
 */
export const selectUneditedTextureUrls = createSelector(
  selectTextureDefs,
  selectTextureBufferKeyHistory,
  (defs, history) => {
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
  }
);

export const selectEditedTextures = (s: AppState) => s.modelData.editedTextures;

/**
 * combines texture defs with any edited data urls
 * to display on scene in real-time
 */
export const selectUpdatedTextureDefs = createSelector(
  selectTextureDefs,
  selectEditedTextures,
  (textureDefs, bufferKeyEntriesEntries): NLUITextureDef[] => {
    const returnTextures = [...textureDefs];
    Object.entries(bufferKeyEntriesEntries).forEach(
      ([index, { bufferKeys }]) => {
        const i = Number.parseInt(index);
        const entry = { ...returnTextures[i] } as NLUITextureDef;
        entry.bufferKeys = {
          ...entry.bufferKeys,
          ...bufferKeys
        };

        returnTextures[i] = entry;
      }
    );

    return returnTextures;
  }
);
export const selectPolygonFileName = (s: AppState) =>
  s.modelData.polygonFileName;

export const selectPolygonBufferKey = (s: AppState) =>
  s.modelData.polygonBufferKey;

export const selectTextureFileName = (s: AppState) =>
  s.modelData.textureFileName;

export const selectModel = createSelector(
  selectModelIndex,
  selectModels,
  (modelIndex, models) => models?.[modelIndex]
);

const EMPTY_SELECTED_VERTEX_GRADIENT_INPUTS: SelectedVertexGradientInputs = {
  selectedVertices: [],
  bounds: undefined
};

const createSelectedVertexGradientInputsSelector = () => {
  let cachedSelectionKey = '';
  let cachedInputs = EMPTY_SELECTED_VERTEX_GRADIENT_INPUTS;

  return createSelector(
    selectSelectedObjectIds,
    selectModel,
    selectModelIndex,
    selectPolygonBufferKey,
    (selectedIds, model, modelIndex, polygonBufferKey) => {
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
    }
  );
};

export const selectSelectedVertexGradientInputs =
  createSelectedVertexGradientInputsSelector();

export type DisplayedMesh = NLMesh & { textureHash: string };

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

export const selectDisplayedMeshes = createSelector(
  selectModel,
  selectUpdatedTextureDefs,
  (model: NLModel, textureDefs: NLUITextureDef[]) =>
    getDisplayedMeshes(model, textureDefs)
);

export const selectAllDisplayedMeshes = createSelector(
  selectModels,
  selectUpdatedTextureDefs,
  (models, textureDef) =>
    models.map((model) => getDisplayedMeshes(model, textureDef))
);

/** infers mesh selection from selected object key */
export const selectObjectMeshIndex = createSelector(
  selectObjectKey,
  (objectKey: string | undefined) =>
    !objectKey ? -1 : Number(objectKey.split('_')[0])
);

/** infers mesh selection from selected object key */
export const selectObjectPolygonIndex = createSelector(
  selectObjectKey,
  selectMeshSelectionType,
  (objectKey: string | undefined, type) => {
    if (type === 'mesh' || !objectKey) {
      return -1;
    }
    return Number(objectKey.split('_')[1]);
  }
);

export const selectMesh = createSelector(
  selectModel,
  selectObjectMeshIndex,
  (model, meshIndex) => model?.meshes[meshIndex] || undefined
);

export const selectReplacementImage = (s: AppState) =>
  s.replaceTexture.replacementImage;

export const selectReplacementTextureIndex = (s: AppState) =>
  s.replaceTexture.textureIndex;

export const selectIsAppInfoDialogShown = (s: AppState) =>
  s.dialogs.dialogShown === 'app-info';

export const selectIsFileSupportDialogShown = (s: AppState) =>
  s.dialogs.dialogShown === 'file-support-info';

export const selectCanExportTextures = createSelector(
  selectTextureFileName,
  selectResourceAttribs,
  (textureFileName, resourceAttribs) =>
    Boolean(textureFileName) && resourceAttribs?.resourceType !== 'cvs2-menu'
);

export const selectTextureFileType = (s: AppState) =>
  s.modelData.textureFileType;

export const selectHasCompressedTextures = (s: AppState) =>
  s.modelData.isLzssCompressed;

export const selectContentViewMode = createSelector(
  selectHasLoadedTextureFile,
  selectHasLoadedPolygonFile,
  (hasLoadedTextures, hasLoadedPolygons): ContentViewMode => {
    if (hasLoadedTextures && !hasLoadedPolygons) {
      return 'textures';
    } else if (hasLoadedPolygons) {
      return 'polygons';
    } else {
      return 'welcome';
    }
  }
);

export const selectSelectedTexture = createSelector(
  selectContentViewMode,
  selectSelectedObjectIds,
  selectTextureIndex,
  (contentViewMode, selectedObjectIds, textureIndex) => {
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
  }
);

export const selectObjectIndex = createSelector(
  selectContentViewMode,
  selectModelIndex,
  selectTextureIndex,
  (viewMode, modelIndex, textureIndex) => {
    switch (viewMode) {
      case 'polygons':
        return modelIndex;
      case 'textures':
        return textureIndex;
      default:
        return -1;
    }
  }
);

export const selectObjectCount = createSelector(
  selectContentViewMode,
  selectModels,
  selectTextureDefs,
  (viewMode, models, textureDefs) => {
    switch (viewMode) {
      case 'polygons':
        return models.length;
      case 'textures':
        return textureDefs.length;
      default:
        return 0;
    }
  }
);

export const selectCanNavObjects = createSelector(
  selectContentViewMode,
  selectObjectCount,
  selectRealModelIndexes,
  (viewMode, objectCount, realModelIndexes) => {
    switch (viewMode) {
      case 'polygons':
        return realModelIndexes.length > 1;
      case 'textures':
        return objectCount > 1;
      default:
        return false;
    }
  }
);

export const selectProcessingOverlayShown = (state: AppState) =>
  state.modelData.exportTextureFileState === 'pending';
