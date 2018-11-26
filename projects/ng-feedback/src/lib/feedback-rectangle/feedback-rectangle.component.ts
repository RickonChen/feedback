import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
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
  public showCloseTag: boolean = false;

  constructor(public feedbackService: FeedbackService) {
  }

  @HostListener('mouseenter')
  public onMouseEnter(): void {
    this.showCloseTag = this.noHover === false;
  }

  @HostListener('mouseleave')
  public onMouseLeave(): void {
    this.showCloseTag = false;
  }

  public onClose(): void {
    this.close.emit();
  }


}
