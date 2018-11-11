import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Rectangle} from '../entity/rectangle';

@Component({
  selector: 'feedback-rectangle',
  templateUrl: './feedback-rectangle.component.html',
  styleUrls: ['./feedback-rectangle.component.css']
})

export class FeedbackRectangleComponent {
  @Input()
  public rectangle: Rectangle;
  @Output()
  public close = new EventEmitter<boolean>();

  public onClose(): void {
    this.close.emit();
  }
}
