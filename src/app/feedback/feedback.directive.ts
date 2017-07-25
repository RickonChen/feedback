import { Directive, HostListener, EventEmitter, Output } from '@angular/core';
import { MdDialog } from '@angular/material';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';
import { FeedbackService } from './feedback.service';

@Directive({ selector: '[feedback]' })
export class FeedbackDirective {
  @Output()
  public onSend = new EventEmitter<object>();
  public constructor(private dialogRef: MdDialog, private feedbackService: FeedbackService ) {
    this.feedbackService.feedback$.subscribe(
      (feedback) => {
        this.onSend.emit(feedback);
      }
    );
  }
  @HostListener('click')
  public onClick() {
    this.openFeedbackDialog();
  }
  public openFeedbackDialog() {
    this.feedbackService.initScreenshotCanvas(document.documentElement);
    let dialogRef = this.dialogRef.open(FeedbackDialogComponent, {
      disableClose: true,
      height: 'auto',
      width: 'auto'
    });
  }
}
