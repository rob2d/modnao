import { createSelector } from '@reduxjs/toolkit';
import { AppState } from './store';

export const selectModelIndex = (s: AppState) => s.modelViewer.modelIndex;

export const selectObjectIndex = (s: AppState) => s.modelViewer.objectIndex;

export const selectStageModels = (s: AppState) => s.stageData.models;

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
  (modelIndex, models) => {
    return models?.[modelIndex];
  }
);
