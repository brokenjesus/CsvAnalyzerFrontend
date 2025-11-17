import { AnalysisResult, PageResponse, ProgressMessage } from '../models/analysis-result.model';

export interface AnalysisState {
  currentAnalysis: AnalysisResult | null;
  history: PageResponse<AnalysisResult> | null;
  loading: boolean;
  error: string | null;
  progress: { [fileId: string]: ProgressMessage };
  uploadProgress: number;
}

export const initialAnalysisState: AnalysisState = {
  currentAnalysis: null,
  history: null,
  loading: false,
  error: null,
  progress: {},
  uploadProgress: 0
};
