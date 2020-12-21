import { Directive, HostListener, EventEmitter, Output, Input, OnInit, Self, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';
import { FeedbackInternalService } from './feedback.service';
import { Overlay } from '@angular/cdk/overlay';
import { Feedback } from './entity/feedback';

export class SendResultFeedback extends Feedback {
  success?: boolean;
  error?: string;
}

@Directive({
  selector: '[feedback]'
})
export class FeedbackDirective implements OnInit, OnChanges {
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
  @Input() descriptionRequired: boolean = false;
  @Input() description: string;
  // Whether to allow cross-origin images to taint the canvas
  @Input() allowTaint: boolean = false;
  @Output() public send = new EventEmitter<Partial<SendResultFeedback>>();

  public constructor(private dialogRef: MatDialog, private feedbackService: FeedbackInternalService, overlay: Overlay) {
    this.overlay = overlay;
  }

  @HostListener('click')
  public onClick() {
    this.openFeedbackDialog();
  }

  public openFeedbackDialog() {
    this.feedbackService.initScreenshotCanvas({ allowTaint: this.allowTaint });
    const dialogRef = this.dialogRef.open(FeedbackDialogComponent, {
      panelClass: 'feedbackDialog',
      backdropClass: 'dialogBackDrop',
      disableClose: true,
      height: 'auto',
      width: 'auto',
      data: {
        descriptionRequired: this.descriptionRequired
      },
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        // Cancel clicked
        this.send.emit({
          error: 'dialog_canceled'
        });
      } else {
        this.send.emit(result);
      }
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
      editDoneLabel: this.editDoneLabel,
      description: this.description
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['description']) {
      this.feedbackService.initialVariables['description'] = changes['description'].currentValue;
    }
  }

}
