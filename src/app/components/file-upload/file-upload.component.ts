import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AnalysisState } from '../../store/analysis.state';
import * as AnalysisActions from '../../store/analysis.actions';
import { selectLoading, selectUploadProgress, selectProgress } from '../../store/analysis.selectors';
import { ProgressMessage, ProcessingStatus } from '../../models/analysis-result.model';
import { WebSocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;

  private subscriptions: Subscription = new Subscription();
  private progressSubscription: Subscription | null = null; // Separate subscription for progress

  loading = false;
  uploadProgress = 0;
  progressEntries: { key: string, value: ProgressMessage }[] = [];

  selectedFile: File | null = null;
  maxSizeMB = 50;
  validTypes = ['text/csv'];

  ProcessingStatus = ProcessingStatus;

  constructor(
    private store: Store<{ analysis: AnalysisState }>,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    // Подписки на store
    this.subscriptions.add(
      this.store.select(selectLoading).subscribe(loading => this.loading = loading)
    );

    this.subscriptions.add(
      this.store.select(selectUploadProgress).subscribe(progress => this.uploadProgress = progress)
    );

    // New logic: Subscribe to progress and re-subscribe to WebSocket if needed
    this.progressSubscription = this.store.select(selectProgress).subscribe(progress => {
      const prevProgressEntries = this.progressEntries; // Keep previous for comparison
      this.progressEntries = Object.entries(progress).map(([key, value]) => ({ key, value }));

      // Check for ongoing processes when the component initializes or when progress updates
      this.progressEntries.forEach(entry => {
        const fileId = entry.key;
        const currentStatus = entry.value.status;
        const previousEntry = prevProgressEntries.find(p => p.key === fileId);
        const previousStatus = previousEntry?.value.status;

        // If a process is ongoing (PENDING/PROCESSING) and we are not already subscribed
        // or if its status just changed to PENDING/PROCESSING (e.g., from an initial store load)
        const isOngoing = currentStatus === ProcessingStatus.PENDING || currentStatus === ProcessingStatus.PROCESSING;
        const wasNotOngoing = !(previousStatus === ProcessingStatus.PENDING || previousStatus === ProcessingStatus.PROCESSING);

        if (isOngoing && !this.wsService.isSubscribed(fileId)) {
          console.log(`Re-subscribing to WebSocket for ongoing file: ${fileId}`);
          // Dispatch a new action to trigger the effect for re-subscription
          this.store.dispatch(AnalysisActions.reSubscribeToProgress({ fileId }));
        }
        // If a process was ongoing and now it's completed/cancelled, ensure we unsubscribe
        else if ((currentStatus === ProcessingStatus.COMPLETED || currentStatus === ProcessingStatus.CANCELLED) && this.wsService.isSubscribed(fileId)) {
          console.log(`Auto-unsubscribing from WebSocket for completed/cancelled file: ${fileId}`);
          this.store.dispatch(AnalysisActions.unsubscribeFromProgress({ fileId }));
        }
      });
    });
    this.subscriptions.add(this.progressSubscription); // Add to main subscriptions
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    // No need to disconnect the global WS here, as it might be used by other parts or reconnected
    // Instead, the auto-unsubscribe in the progressUpdate handler should manage individual subscriptions.
    // If you want to ensure all active subscriptions are closed on component destroy, you would iterate them here:
    // this.progressEntries.forEach(entry => {
    //   if (entry.value.status === ProcessingStatus.PENDING || entry.value.status === ProcessingStatus.PROCESSING) {
    //     this.wsService.unsubscribeFromProgress(entry.key);
    //   }
    // });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    if (!this.validTypes.includes(file.type)) {
      alert('Пожалуйста, выберите CSV файл');
      this.clearFile();
      return;
    }

    if (file.size > this.maxSizeMB * 1024 * 1024) {
      alert(`Файл слишком большой. Максимальный размер: ${this.maxSizeMB} МБ`);
      this.clearFile();
      return;
    }

    this.selectedFile = file;
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      alert('Пожалуйста, выберите файл');
      return;
    }

    this.store.dispatch(AnalysisActions.uploadFile({ file: this.selectedFile }));
  }

  clearFile(): void {
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  cancelProcessing(fileId: string): void {
    this.wsService.cancelProcessing(fileId);
    this.store.dispatch(AnalysisActions.cancelProcessing({ fileId }));
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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('ru-RU');
  }
}
