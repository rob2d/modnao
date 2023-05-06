import { createSelector } from '@reduxjs/toolkit';
import { AppState } from './store';

export const selectModelViewedIndex = (s: AppState) =>
  s.modelViewer.modelViewedIndex;

export const selectObjectIndex = (s: AppState) => s.modelViewer.objectIndex;

export const selectStageModels = (s: AppState) => s.stageData.models;

export const selectModelCount = createSelector(
  selectStageModels,
  (models) => models.length
);
export const selectObjectSelectionType = (s: AppState) =>
  s.modelViewer.objectSelectionType;

export const selectModel = createSelector(
  selectModelViewedIndex,
  selectStageModels,
  (modelViewedIndex, models) => {
    console.log('modelViewedIndex ->', modelViewedIndex);
    return models?.[modelViewedIndex];
  }
);
