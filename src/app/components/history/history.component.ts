import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AnalysisState } from '../../store/analysis.state';
import { AnalysisResult, PageResponse, ProcessingStatus } from '../../models/analysis-result.model';
import * as AnalysisActions from '../../store/analysis.actions';
import { selectHistory, selectLoading } from '../../store/analysis.selectors';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  loading = false;
  history: PageResponse<AnalysisResult> | null = null;

  currentPage = 0;
  pageSize = 5;

  constructor(private store: Store<{ analysis: AnalysisState }>) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store.select(selectLoading).subscribe(loading => {
        this.loading = loading;
      })
    );

    this.subscriptions.add(
      this.store.select(selectHistory).subscribe(history => {
        this.history = history;
      })
    );

    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadHistory(): void {
    this.store.dispatch(AnalysisActions.loadHistory({
      page: this.currentPage,
      size: this.pageSize
    }));
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadHistory();
  }

  deleteAnalysis(fileId: string): void {
    if (confirm('Вы уверены, что хотите удалить этот анализ?')) {
      this.store.dispatch(AnalysisActions.deleteAnalysis({ id: fileId }));
    }

    setTimeout(() => {
      this.loadHistory();
    }, 100);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDuration(ms: number): string {
    const seconds = ms / 1000;

    if (seconds < 10) {
      return `${seconds.toFixed(1)} s`;
    } else {
      return `${Math.round(seconds)} s`;
    }
  }

  getStatusText(status: ProcessingStatus): string {
    const statusMap = {
      [ProcessingStatus.PENDING]: 'Ожидание',
      [ProcessingStatus.PROCESSING]: 'Обработка',
      [ProcessingStatus.COMPLETED]: 'Завершено',
      [ProcessingStatus.FAILED]: 'Ошибка',
      [ProcessingStatus.CANCELLED]: 'Отменено'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: ProcessingStatus): string {
    const classMap = {
      [ProcessingStatus.PENDING]: 'bg-secondary',
      [ProcessingStatus.PROCESSING]: 'bg-info',
      [ProcessingStatus.COMPLETED]: 'bg-success',
      [ProcessingStatus.FAILED]: 'bg-danger',
      [ProcessingStatus.CANCELLED]: 'bg-warning'
    };
    return classMap[status] || 'bg-secondary';
  }

  getPages(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
}
