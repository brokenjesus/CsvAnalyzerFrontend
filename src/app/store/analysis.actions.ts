import { createAction, props } from '@ngrx/store';
import { AnalysisResult, PageResponse, ProgressMessage, FileUploadResponse } from '../models/analysis-result.model';

export const uploadFile = createAction(
  '[Analysis] Upload File',
  props<{ file: File }>()
);

export const uploadFileSuccess = createAction(
  '[Analysis] Upload File Success',
  props<{ response: FileUploadResponse }>()
);

export const uploadFileFailure = createAction(
  '[Analysis] Upload File Failure',
  props<{ error: string }>()
);

export const loadHistory = createAction(
  '[Analysis] Load History',
  props<{ page: number; size: number }>()
);

export const loadHistorySuccess = createAction(
  '[Analysis] Load History Success',
  props<{ pageResponse: PageResponse<AnalysisResult> }>()
);

export const loadHistoryFailure = createAction(
  '[Analysis] Load History Failure',
  props<{ error: string }>()
);

export const loadAnalysisDetails = createAction(
  '[Analysis] Load Analysis Details',
  props<{ id: string }>()
);

export const loadAnalysisDetailsSuccess = createAction(
  '[Analysis] Load Analysis Details Success',
  props<{ analysis: AnalysisResult }>()
);

export const loadAnalysisDetailsFailure = createAction(
  '[Analysis] Load Analysis Details Failure',
  props<{ error: string }>()
);

export const deleteAnalysis = createAction(
  '[Analysis] Delete Analysis',
  props<{ id: string }>()
);

export const deleteAnalysisSuccess = createAction(
  '[Analysis] Delete Analysis Success',
  props<{ id: string }>()
);

export const deleteAnalysisFailure = createAction(
  '[Analysis] Delete Analysis Failure',
  props<{ error: string }>()
);

export const progressUpdate = createAction(
  '[Analysis] Progress Update',
  props<{ progress: ProgressMessage }>()
);

export const unsubscribeFromProgress = createAction(
  '[Analysis] Unsubscribe From Progress',
  props<{ fileId: string }>()
);

export const reSubscribeToProgress = createAction(
  '[Analysis] Re-Subscribe To Progress',
  props<{ fileId: string }>()
);


export const cancelProcessing = createAction(
  '[Analysis] Cancel Processing',
  props<{ fileId: string }>()
);

export const cancelProcessingSuccess = createAction(
  '[Analysis] Cancel Processing Success'
);

export const cancelProcessingFailure = createAction(
  '[Analysis] Cancel Processing Failure',
  props<{ error: string }>()
);
