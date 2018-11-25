import {Component, ElementRef, EventEmitter, Input, Output} from '@angular/core';
import {Rectangle} from '../entity/rectangle';
import {FeedbackService} from '../feedback.service';

@Component({
  selector: 'feedback-rectangle',
  templateUrl: './feedback-rectangle.component.html',
  styleUrls: ['./feedback-rectangle.component.css']
})

export class FeedbackRectangleComponent {
  @Input()
  public rectangle: Rectangle;
  @Input()
  public noHover: boolean;
  @Output()
  public close = new EventEmitter<boolean>();

  constructor(public feedbackService: FeedbackService) {
  }

  public onClose(): void {
    this.close.emit();
  }


}
