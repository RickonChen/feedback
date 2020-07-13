import { Directive, HostListener, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { Feedback } from './entity/feedback';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';
import { FeedbackService } from './feedback.service';

@Directive({selector: '[feedback]'})
export class FeedbackDirective implements OnInit {
  private overlay: Overlay;
  @Input() title: string = 'Send feedback';
  @Input() placeholder: string = 'Describe your issue or share your ideas';
  @Input() editTip = 'Click to highlight or hide info';
  @Input() checkboxLabel = 'Include screenshot';
  @Input() cancelLabel = 'CANCEL';
  @Input() sendLabel = 'SEND';
  @Input() moveToolbarTip = 'move toolbar';
  @Input() drawRectTip = 'Draw using yellow to highlight issues or black to hide sensitive info';
  @Input() highlightTip = 'highlight issues';
  @Input() hideTip = 'hide sensitive info';
  @Input() editDoneLabel = 'DONE';
  @Output() public send = new EventEmitter<Feedback>();

  public constructor(private dialogRef: MatDialog, private feedbackService: FeedbackService, overlay: Overlay) {
    this.feedbackService.feedback$.subscribe(
      (feedback) => {
        this.send.emit(feedback);
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
    this.dialogRef.open(FeedbackDialogComponent, {
      panelClass: 'feedbackDialog',
      backdropClass: 'dialogBackDrop',
      disableClose: true,
      height: 'auto',
      width: 'auto',
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });
  }

  ngOnInit(): void {
    this.feedbackService.initialVariables = {
      title: this.title,
      placeholder: this.placeholder,
      editTip: this.editTip,
      checkboxLabel: this.checkboxLabel,
      cancelLabel: this.cancelLabel,
      sendLabel: this.sendLabel,
      moveToolbarTip: this.moveToolbarTip,
      drawRectTip: this.drawRectTip,
      highlightTip: this.highlightTip,
      hideTip: this.hideTip,
      editDoneLabel: this.editDoneLabel
    };
  }
}
