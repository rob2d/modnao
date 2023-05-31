import { createSelector } from '@reduxjs/toolkit';
import { AppState } from './store';

export const selectModelIndex = (s: AppState) => s.modelViewer.modelIndex;

export const selectObjectKey = (s: AppState) => s.modelViewer.objectKey;

export const selectStageModels = (s: AppState) => s.stageData.models;

export const selectHasLoadedStageTextureFile = (s: AppState) =>
  s.stageData.textureFileName;

export const selectHasReplacementTextures = (s: AppState) =>
  s.stageData.hasReplacementTextures;

export const selectModelCount = createSelector(
  selectStageModels,
  (models) => models.length
);
export const selectObjectSelectionType = (s: AppState) =>
  s.modelViewer.objectSelectionType;

export const selectTextureDefs = (s: AppState) => s.stageData.textureDefs;

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
