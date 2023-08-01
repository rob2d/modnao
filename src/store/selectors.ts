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
  (textureDefs, bufferUrlEntries): typeof textureDefs => {
    const returnTextures = [...textureDefs];
    Object.entries(bufferUrlEntries).forEach(([index, { bufferUrls }]) => {
      const i = Number.parseInt(index);
      const entry = { ...returnTextures[i] };
      entry.bufferUrls = {
        ...entry.bufferUrls,
        ...bufferUrls
      };
      returnTextures[i] = entry;
    });

    console.log('returnTextures ->', returnTextures);
    return returnTextures;
  }
);
export const selectPolygonFileName = (s: AppState) =>
  s.modelData.polygonFileName;

export const selectTextureFileName = (s: AppState) =>
  s.modelData.textureFileName;

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

export const selectIsMeshOpaque = createSelector(
  selectModel,
  selectObjectMeshIndex,
  (model, meshIndex) => model?.meshes[meshIndex]?.isOpaque
);
