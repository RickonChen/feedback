import {Directive, HostListener, EventEmitter, Output} from '@angular/core';
import {DialogPosition, MatDialog} from '@angular/material';
import {FeedbackDialogComponent} from './feedback-dialog/feedback-dialog.component';
import {FeedbackService} from './feedback.service';
import {Overlay} from '@angular/cdk/overlay';

@Directive({selector: '[feedback]'})
export class FeedbackDirective {
  private overlay: Overlay;

  @Output()// tslint:disable-line
  public onSend = new EventEmitter<object>();

  public constructor(private dialogRef: MatDialog, private feedbackService: FeedbackService, overlay: Overlay) {
    this.feedbackService.feedback$.subscribe(
      (feedback) => {
        this.onSend.emit(feedback);
      }
    );
    this.overlay = overlay;
  }

  @HostListener('click')
  public onClick() {
    this.openFeedbackDialog();
  }

  public openFeedbackDialog() {
    this.feedbackService.initScreenshotCanvas();
    const dialogRef = this.dialogRef.open(FeedbackDialogComponent, {
      backdropClass: 'dialogBackDrop',
      disableClose: true,
      height: 'auto',
      width: 'auto',
      // scrollStrategy: this.overlay.scrollStrategies.reposition()
    });
  }
}
