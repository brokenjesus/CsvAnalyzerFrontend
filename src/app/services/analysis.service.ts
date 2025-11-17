import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AnalysisResult, FileUploadResponse, PageResponse } from '../models/analysis-result.model';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FileUploadResponse>(`${this.apiUrl}/analyze`, formData);
  }

  getHistory(page: number = 0, size: number = 5): Observable<PageResponse<AnalysisResult>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<AnalysisResult>>(`${this.apiUrl}/history`, { params });
  }

  getAnalysisDetails(fileId: string): Observable<AnalysisResult> {
    return this.http.get<AnalysisResult>(`${this.apiUrl}/history/${fileId}`);
  }

  deleteAnalysis(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/history/${fileId}`);
  }

  cancelProcessing(fileId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cancel/${fileId}`, {});
  }
}
