import { createReducer, on } from '@ngrx/store';
import { AnalysisState, initialAnalysisState } from './analysis.state';
import * as AnalysisActions from './analysis.actions';

export const analysisReducer = createReducer(
  initialAnalysisState,

  // Загрузка файла
  on(AnalysisActions.uploadFile, (state) => ({
    ...state,
    loading: true,
    error: null,
    uploadProgress: 0
  })),

  on(AnalysisActions.uploadFileSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    uploadProgress: 100
  })),

  on(AnalysisActions.uploadFileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    uploadProgress: 0
  })),

  // Получение истории
  on(AnalysisActions.loadHistory, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AnalysisActions.loadHistorySuccess, (state, { pageResponse }) => ({
    ...state,
    loading: false,
    history: pageResponse
  })),

  on(AnalysisActions.loadHistoryFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Детали анализа
  on(AnalysisActions.loadAnalysisDetails, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AnalysisActions.loadAnalysisDetailsSuccess, (state, { analysis }) => ({
    ...state,
    loading: false,
    currentAnalysis: analysis
  })),

  on(AnalysisActions.loadAnalysisDetailsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Удаление анализа
  on(AnalysisActions.deleteAnalysis, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(AnalysisActions.deleteAnalysisSuccess, (state, { id }) => ({
    ...state,
    loading: false,
    history: state.history ? {
      ...state.history,
      content: state.history.content.filter(item => item.id !== id)
    } : null
  })),

  on(AnalysisActions.deleteAnalysisFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Прогресс
  on(AnalysisActions.progressUpdate, (state, { progress }) => ({
    ...state,
    progress: {
      ...state.progress,
      [progress.fileId]: progress
    }
  })),

  // Отмена обработки
  on(AnalysisActions.cancelProcessing, (state) => ({
    ...state,
    loading: true
  })),

  on(AnalysisActions.cancelProcessingSuccess, (state) => ({
    ...state,
    loading: false
  })),

  on(AnalysisActions.cancelProcessingFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
