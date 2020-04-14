import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {FeedbackDialogComponent} from './feedback-dialog/feedback-dialog.component';
import {FeedbackToolbarComponent} from './feedback-toolbar/feedback-toolbar.component';
import {FeedbackRectangleComponent} from './feedback-rectangle/feedback-rectangle.component';
import {
  MatDialogModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatTooltipModule,
  MatCheckboxModule,
  MatProgressSpinnerModule
} from '@angular/material';
import {FeedbackInternalService} from './feedback.service';
import {FeedbackDirective} from './feedback.directive';
import { OverlayModule, OVERLAY_PROVIDERS } from '@angular/cdk/overlay';

@NgModule({
  declarations: [
    FeedbackDialogComponent,
    FeedbackToolbarComponent,
    FeedbackRectangleComponent,
    FeedbackDirective
  ],
  imports: [
    OverlayModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    FeedbackDirective,
    OverlayModule
  ],
  entryComponents: [
    FeedbackDialogComponent
  ],
  providers: [
    FeedbackInternalService
  ]
})
export class FeedbackModule {
}
