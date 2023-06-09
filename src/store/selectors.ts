import { createSelector } from '@reduxjs/toolkit';
import { AppState } from './store';

export const selectModelIndex = (s: AppState) => s.modelViewer.modelIndex;

export const selectObjectKey = (s: AppState) => s.modelViewer.objectKey;

export const selectStageModels = (s: AppState) => s.modelData.models;

export const selectHasLoadedTextureFile = (s: AppState) =>
  s.modelData.textureFileName;

export const selectHasEditedTextures = (s: AppState) =>
  s.modelData.hasEditedTextures;

export const selectHasCompressedTextures = (s: AppState) =>
  s.modelData.hasCompressedTextures;

export const selectModelCount = createSelector(
  selectStageModels,
  (models) => models.length
);
export const selectObjectSelectionType = (s: AppState) =>
  s.modelViewer.objectSelectionType;

export const selectTextureDefs = (s: AppState) => s.modelData.textureDefs;

export const selectEditedTextures = (s: AppState) => s.modelData.editedTextures;

/**
 * combines texture defs with any edited data urls
 * to display on scene in real-time
 */
export const selectSceneTextureDefs = createSelector(
  selectTextureDefs,
  selectEditedTextures,
  (textureDefs, dataUrlEntries): typeof textureDefs => {
    const returnTextures = [...textureDefs];
    Object.entries(dataUrlEntries).forEach(([index, dataUrls]) => {
      const i = Number.parseInt(index);
      const entry = { ...returnTextures[i] };
      entry.dataUrls = {
        ...entry.dataUrls,
        ...dataUrls
      };
      returnTextures[i] = entry;
    });

    return returnTextures;
  }
);
export const selectPolygonFileName = (s: AppState) =>
  s.modelData.polygonFileName;

export const selectModel = createSelector(
  selectModelIndex,
  selectStageModels,
  (modelIndex, models) => models?.[modelIndex]
);

/** infers mesh selection from selected object key */
export const selectObjectMeshIndex = createSelector(
  selectObjectKey,
  (objectKey: string | undefined) =>
    !objectKey ? -1 : Number(objectKey.split('-')[0])
);
