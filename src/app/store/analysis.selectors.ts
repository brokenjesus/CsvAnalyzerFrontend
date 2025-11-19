import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AnalysisState } from './analysis.state';

export const selectAnalysisState = createFeatureSelector<AnalysisState>('analysis');

export const selectCurrentAnalysis = createSelector(
    selectAnalysisState,
    (state: AnalysisState) => state.currentAnalysis
);

export const selectHistory = createSelector(
    selectAnalysisState,
    (state: AnalysisState) => state.history
);

export const selectLoading = createSelector(
    selectAnalysisState,
    (state: AnalysisState) => state.loading
);

export const selectError = createSelector(
    selectAnalysisState,
    (state: AnalysisState) => state.error
);

export const selectProgress = createSelector(
    selectAnalysisState,
    (state: AnalysisState) => state.progress
);

export const selectUploadProgress = createSelector(
    selectAnalysisState,
    (state: AnalysisState) => state.uploadProgress
);
