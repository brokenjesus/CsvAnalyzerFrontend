import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { HistoryComponent } from './components/history/history.component';
import { AnalysisDetailsComponent } from './components/analysis-details/analysis-details.component';

import { analysisReducer } from './store/analysis.reducer';
import { AnalysisEffects } from './store/analysis.effects';

@NgModule({
  declarations: [
    AppComponent,
    FileUploadComponent,
    HistoryComponent,
    AnalysisDetailsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule.forRoot([
      { path: '', component: FileUploadComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'analysis/:id', component: AnalysisDetailsComponent },
      { path: '**', redirectTo: '' }
    ]),
    StoreModule.forRoot({ analysis: analysisReducer }),
    EffectsModule.forRoot([AnalysisEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
