import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { AnalysisService } from '../services/analysis.service';
import { WebSocketService } from '../services/websocket.service';
import * as AnalysisActions from './analysis.actions';
import { Store } from "@ngrx/store";
import { ProcessingStatus } from "../models/analysis-result.model"; // Import ProcessingStatus

@Injectable()
export class AnalysisEffects {

  uploadFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AnalysisActions.uploadFile),
      mergeMap(({ file }) =>
        this.analysisService.uploadFile(file).pipe(
          map(response => AnalysisActions.uploadFileSuccess({ response })),
          catchError(error => of(AnalysisActions.uploadFileFailure({ error: error.message })))
        )
      )
    )
  );

  subscribeToProgressOnUploadSuccess$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AnalysisActions.uploadFileSuccess),
        tap(({ response }) => {
          const fileId = response.fileId;
          if (!fileId) {
            console.error('uploadFileSuccess response has no fileId', response);
            return;
          }
          console.log(`Subscribing to WebSocket for newly uploaded file: ${fileId}`);
          this.webSocketService.subscribeToProgress(fileId, progressMsg => {
            this.store.dispatch(AnalysisActions.progressUpdate({ progress: progressMsg }));
          });
        })
      ),
    { dispatch: false }
  );

  // New effect for re-subscribing to progress
  reSubscribeToProgress$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AnalysisActions.reSubscribeToProgress),
        tap(({ fileId }) => {
          // Only subscribe if not already subscribed
          if (!this.webSocketService.isSubscribed(fileId)) {
            console.log(`Effect: Re-subscribing to WebSocket for file: ${fileId}`);
            this.webSocketService.subscribeToProgress(fileId, progressMsg => {
              this.store.dispatch(AnalysisActions.progressUpdate({ progress: progressMsg }));
            });
          } else {
            console.log(`Effect: Already subscribed to WebSocket for file: ${fileId}. Skipping re-subscription.`);
          }
        })
      ),
    { dispatch: false }
  );


  unsubscribeFromProgress$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AnalysisActions.unsubscribeFromProgress),
        tap(({ fileId }) => {
          this.webSocketService.unsubscribeFromProgress(fileId);
        })
      ),
    { dispatch: false }
  );

  // Auto-unsubscribe logic moved from component to effect to be more reactive to state changes
  // This effect will react to `progressUpdate` actions
  autoUnsubscribeOnCompletion$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AnalysisActions.progressUpdate),
        tap(({ progress }) => {
          if (progress.status === ProcessingStatus.COMPLETED || progress.status === ProcessingStatus.CANCELLED || progress.status === ProcessingStatus.FAILED) {
            console.log(`Processing ${progress.status} for file: ${progress.fileId}. Unsubscribing.`);
            this.store.dispatch(AnalysisActions.unsubscribeFromProgress({ fileId: progress.fileId }));
          }
        })
      ),
    { dispatch: false }
  );

  loadHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AnalysisActions.loadHistory),
      mergeMap(({ page, size }) => // Добавлен size
        this.analysisService.getHistory(page, size).pipe(
          map(pageResponse => AnalysisActions.loadHistorySuccess({ pageResponse })),
          catchError(error => of(AnalysisActions.loadHistoryFailure({ error: error.message })))
        )
      )
    )
  );

  loadAnalysisDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AnalysisActions.loadAnalysisDetails),
      mergeMap(({ id }) =>
        this.analysisService.getAnalysisDetails(id).pipe(
          map(analysis => AnalysisActions.loadAnalysisDetailsSuccess({ analysis })),
          catchError(error => of(AnalysisActions.loadAnalysisDetailsFailure({ error: error.message })))
        )
      )
    )
  );

  deleteAnalysis$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AnalysisActions.deleteAnalysis),
      mergeMap(({ id }) =>
        this.analysisService.deleteAnalysis(id).pipe(
          map(() => AnalysisActions.deleteAnalysisSuccess({ id })),
          catchError(error => of(AnalysisActions.deleteAnalysisFailure({ error: error.message })))
        )
      )
    )
  );

  cancelProcessing$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AnalysisActions.cancelProcessing),
      mergeMap(({ fileId }) =>
        this.analysisService.cancelProcessing(fileId).pipe(
          map(() => AnalysisActions.cancelProcessingSuccess()),
          catchError(error => of(AnalysisActions.cancelProcessingFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private analysisService: AnalysisService,
    private webSocketService: WebSocketService,
    private store: Store
  ) {}
}
