  import { Component, OnInit, OnDestroy } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { Store } from '@ngrx/store';
  import { Subscription } from 'rxjs';
  import { AnalysisState } from '../../store/analysis.state';
  import { AnalysisResult } from '../../models/analysis-result.model';
  import * as AnalysisActions from '../../store/analysis.actions';
  import { selectCurrentAnalysis, selectLoading } from '../../store/analysis.selectors';

  @Component({
    selector: 'app-analysis-details',
    templateUrl: './analysis-details.component.html',
    styleUrls: ['./analysis-details.component.scss']
  })
  export class AnalysisDetailsComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription = new Subscription();

    loading = false;
    analysis: AnalysisResult | null = null;

    constructor(
      private route: ActivatedRoute,
      private store: Store<{ analysis: AnalysisState }>
    ) {}

    ngOnInit(): void {
      this.subscriptions.add(
        this.store.select(selectLoading).subscribe(loading => {
          this.loading = loading;
        })
      );

      this.subscriptions.add(
        this.store.select(selectCurrentAnalysis).subscribe(analysis => {
          this.analysis = analysis;
        })
      );

      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.store.dispatch(AnalysisActions.loadAnalysisDetails({ id }));
      }
    }

    ngOnDestroy(): void {
      this.subscriptions.unsubscribe();
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

    getStatusText(status: string): string {
      const statusMap: { [key: string]: string } = {
        'PENDING': 'Ожидание',
        'PROCESSING': 'Обработка',
        'COMPLETED': 'Завершено',
        'FAILED': 'Ошибка',
        'CANCELLED': 'Отменено'
      };
      return statusMap[status] || status;
    }

    getStatusClass(status: string): string {
      const classMap: { [key: string]: string } = {
        'PENDING': 'bg-secondary',
        'PROCESSING': 'bg-info',
        'COMPLETED': 'bg-success',
        'FAILED': 'bg-danger',
        'CANCELLED': 'bg-warning'
      };
      return classMap[status] || 'bg-secondary';
    }
  }
