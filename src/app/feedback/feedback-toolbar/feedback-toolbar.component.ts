import {fromEvent as observableFromEvent} from 'rxjs';

import {takeUntil, finalize, map, mergeMap} from 'rxjs/operators';
import {Component, ElementRef, Input, Output, EventEmitter, AfterViewInit, ViewChild, OnChanges} from '@angular/core';


@Component({
  selector: 'feedback-toolbar',
  templateUrl: './feedback-toolbar.component.html',
  styleUrls: ['./feedback-toolbar.component.css']
})

export class FeedbackToolbarComponent implements AfterViewInit, OnChanges {
  @Input()
  public drawColor: string;
  @Output()
  public manipulate = new EventEmitter<string>();
  public disableToolbarTips = false;
  @ViewChild('toggleMove')
  private toggleMoveBtn: ElementRef;
  public isSwitch = false;

  constructor(public el: ElementRef) {
  }

  public ngAfterViewInit() {
    const elStyle = this.el.nativeElement.style;
    elStyle.position = 'absolute';
    elStyle.left = '43%';
    elStyle.top = '60%';
    this.addDragListenerOnMoveBtn();
  }

  public ngOnChanges() {
    this.isSwitch = this.drawColor !== 'yellow';
  }

  public done() {
    this.manipulate.emit('done');
  }

  public toggleHighlight() {
    this.isSwitch = false;
    this.manipulate.emit('yellow');
  }

  public toggleHide() {
    this.isSwitch = true;
    this.manipulate.emit('black');
  }

  public addDragListenerOnMoveBtn() {
    const mouseUp = observableFromEvent(this.toggleMoveBtn.nativeElement, 'mouseup');
    const mouseMove = observableFromEvent(document.documentElement, 'mousemove');
    const mouseDown = observableFromEvent(this.toggleMoveBtn.nativeElement, 'mousedown');
    const mouseDrag = mouseDown.pipe(mergeMap((md: MouseEvent) => {
      const startX = md.offsetX;
      const startY = md.offsetY;
      this.disableToolbarTips = true;
      // Calculate dif with mousemove until mouseup
      return mouseMove.pipe(
        map((mm: MouseEvent) => {
          mm.preventDefault();
          return {
            left: mm.clientX - startX,
            top: mm.clientY - startY
          };
        }),
        finalize(() => {
          this.disableToolbarTips = false;
        }),
        takeUntil(mouseUp));
    }));
    mouseDrag.subscribe(
      (pos) => {
        this.el.nativeElement.style.left = pos.left + 'px';
        this.el.nativeElement.style.top = pos.top + 'px';
      });
  }
}
