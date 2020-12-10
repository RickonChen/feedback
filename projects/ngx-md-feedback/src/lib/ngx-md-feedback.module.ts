import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';
import { FeedbackToolbarComponent } from './feedback-toolbar/feedback-toolbar.component';
import { FeedbackRectangleComponent } from './feedback-rectangle/feedback-rectangle.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeedbackInternalService } from './feedback.service';
import { FeedbackDirective } from './feedback.directive';

@NgModule({
  declarations: [
    FeedbackDialogComponent,
    FeedbackToolbarComponent,
    FeedbackRectangleComponent,
    FeedbackDirective
  ],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  exports: [
    FeedbackDirective,
    FeedbackDialogComponent
  ],
  entryComponents: [
    FeedbackDialogComponent
  ],
  providers: [
    FeedbackInternalService,
    { provide: MatDialogRef, useValue: {} }
  ]
})
export class NgxMdFeedbackModule {
}
