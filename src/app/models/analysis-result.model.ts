export interface AnalysisResult {
  id: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  uploadTime: string;
  processStartTime: string;
  processEndTime: string;
  status: ProcessingStatus;
  statistics: AnalysisStatistics;
  processingTimeMs: number;
  successRate: number;
  errorRate: number;
}

export interface AnalysisStatistics {
  totalRecords: number;
  processedRecords: number;
  skippedRecords: number;
  minValue: number;
  maxValue: number;
  meanValue: number;
  stdDeviation: number;
  uniqueValuesCount: number;
}

export enum ProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface  PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProgressMessage {
  fileId: string;
  status: ProcessingStatus;
  progress: number;
  message: string;
  timestamp: string;
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
}
