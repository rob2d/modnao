import { createSelector } from '@reduxjs/toolkit';
import { AppState } from './store';

export const selectModelViewedIndex = (s: AppState) =>
  s.modelViewer.modelViewedIndex;

export const selectStageModels = (s: AppState) => s.stageData.models;
export const selectObjectSelectionType = (s: AppState) =>
  s.modelViewer.objectSelectionType;

export const selectModel = createSelector(
  selectModelViewedIndex,
  selectStageModels,
  (modelViewedIndex, models) => models?.[modelViewedIndex]
);
