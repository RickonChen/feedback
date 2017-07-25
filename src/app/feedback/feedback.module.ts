/**
 * Created by chenri4 on 7/13/2017.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';
import { FeedbackToolbarComponent } from './feedback-toolbar/feedback-toolbar.component';
import {
  MdDialogModule,
  MdButtonModule,
  MdIconModule,
  MdInputModule,
  MdTooltipModule,
  MdCheckboxModule,
  MdProgressSpinnerModule } from '@angular/material';
import { FeedbackService } from './feedback.service';
import { FeedbackDirective } from './feedback.directive';

@NgModule({
  declarations: [
    FeedbackDialogComponent,
    FeedbackToolbarComponent,
    FeedbackDirective
  ],
  imports: [
    MdDialogModule,
    MdButtonModule,
    MdIconModule,
    MdInputModule,
    MdTooltipModule,
    CommonModule,
    FormsModule,
    MdCheckboxModule,
    MdProgressSpinnerModule
  ],
  exports: [
    FeedbackDirective
  ],
  entryComponents: [
    FeedbackDialogComponent
  ],
  providers: [
    FeedbackService
  ]
})
export class FeedbackModule {
}
