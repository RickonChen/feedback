
import {fromEvent as observableFromEvent} from 'rxjs';

import {takeUntil, finalize, map, mergeMap} from 'rxjs/operators';
import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Feedback } from '../entity/feedback';
import { FeedbackService } from '../feedback.service';

import { Rectangle } from '../entity/rectangle';

@Component({
  selector: 'feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.css']
})

export class FeedbackDialogComponent implements AfterViewInit {
  public showToolbar = false;
  public title: string;
  public descriptionTips: string;
  public feedback = new Feedback();
  public includeScreenshot: boolean;
  public showSpinner = true;
  public screenshotEle: any;
  public screenshotCanvas: any;
  public drawCanvas: any;
  public showToolbarTips = true;
  @ViewChild('screenshotParent')
  public screenshotParent: ElementRef;
  public drawColor = 'yellow';
  private rectangles: any[] = [];
  private scrollWidth = window.innerWidth || document.body.clientWidth;
  private scrollHeight = window.innerHeight || document.body.clientHeight;

  constructor(public dialogRef: MatDialogRef<FeedbackDialogComponent>,
              private feedbackService: FeedbackService,
              private detector: ChangeDetectorRef,
              private el: ElementRef) {
    this.title = 'Send feedback';
    this.descriptionTips = 'Describe your issue or share your ideas';
    this.feedback = new Feedback();
    this.feedback.description = '';
    this.includeScreenshot = true;
  }
  public ngAfterViewInit() {
    this.feedbackService.screenshotCanvas$.subscribe(
      (canvas) => {
        this.showSpinner = false;
        if (!this.screenshotCanvas) {
          this.feedback.screenshot = canvas.toDataURL('image/png');
          this.screenshotCanvas = canvas;
        }
        this.screenshotEle = this.feedbackService.getImgEle(canvas);
        this.appendScreenshot();
      }
    );
    this.dialogRef.afterClosed().subscribe((sendNow) => {
      if (sendNow === true) {
        this.feedbackService.setFeedback(this.feedback);
      }
    });
  }
  public expandDrawingBoard() {
    this.showToolbar = true;
    if (!this.drawCanvas) {
      this.initBackgroundCanvas();
    }
    this.el.nativeElement.appendChild(this.screenshotCanvas);
    this.el.nativeElement.appendChild(this.drawCanvas);
    console.log('expand the board');
  }
  @HostListener('document:keydown.escape', ['$event'])
  public onEscapeKeyDownHandler(evt: KeyboardEvent) {
    this.showToolbar = false;
    this.includeScreenshot = true;
    this.detector.detectChanges();
    this.dialogRef.close('key down esc to close');
  }
  public manipulate(manipulation: string) {
    if (manipulation === 'done') {
      this.mergeCanvas();
      this.el.nativeElement.removeChild(this.screenshotCanvas);
      this.el.nativeElement.removeChild(this.drawCanvas);
    }else {
      this.startDraw(manipulation);
    }
  }
  public mergeCanvas() {
    this.showToolbar = false;
    this.detector.detectChanges();
    this.appendScreenshot();
    let mergedCanvas = document.createElement('canvas');
    let x;
    let y;
    let ctx = mergedCanvas.getContext('2d');
    if (ctx === null) {
      return;
    }
    x = mergedCanvas.width;
    y = mergedCanvas.height;
    mergedCanvas.width = this.screenshotCanvas.width;
    mergedCanvas.height = this.screenshotCanvas.height;
    ctx.drawImage(this.screenshotCanvas, 0, 0);
    ctx.drawImage(this.drawCanvas, 0, 0);
    this.feedback.screenshot = mergedCanvas.toDataURL('image/png');
    mergedCanvas.width = x;
    mergedCanvas.height = y;
    ctx.clearRect(0, 0, mergedCanvas.width, mergedCanvas.height);
    ctx.drawImage(this.screenshotCanvas, 0, 0, 360, 200);
    ctx.drawImage(this.drawCanvas, 0, 0, 360, 200);
    this.feedbackService.setCanvas(mergedCanvas);
  }
  public startDraw(color: string) {
    this.drawColor = color;
  }
  private isIncludeScreenshot() {
    if (this.includeScreenshot) {
      this.detector.detectChanges();
      this.showSpinner = false;
      this.appendScreenshot();
    }else {
      this.showSpinner = true;
    }
  }
  private appendScreenshot() {
    this.screenshotParent.nativeElement.appendChild(this.screenshotEle);
  }
  private initCanvasStyle(canvas: HTMLElement) {
    let style = canvas.style;
    style.position = 'absolute';
    style.top = '0';
    style.left = '0';
    style.zIndex = '-1';
  }
  private initBackgroundCanvas() {
    let pageCanvas = this.screenshotCanvas;
    this.initCanvasStyle(pageCanvas);
    pageCanvas.style.height = this.scrollHeight;
    pageCanvas.style.width = this.scrollWidth;
    this.drawCanvas = document.createElement('canvas');
    this.drawCanvas.style.cursor = 'crosshair';
    this.initCanvasStyle(this.drawCanvas);
    // The canvas to draw, must use this way to initial the height and width
    this.drawCanvas.height = this.scrollHeight;
    this.drawCanvas.width = this.scrollWidth;
    this.drawContainerRec();
    this.addDragListenerOnCanvas();
  }
  private drawContainerRec() {
    let drawContext = this.drawCanvas.getContext('2d');
    drawContext.beginPath();
    let width = this.scrollWidth;
    let height = this.scrollHeight;
    drawContext.fillStyle = 'rgba(0,0,0,0.3)';
    drawContext.fillRect(0, 0, width, height); // draw the rectangle
  }
  private drawRectangle(context: CanvasRenderingContext2D, rec: Rectangle) {
    context.clearRect(rec.startX, rec.startY, rec.width, rec.height);
    context.beginPath();
    if (rec.color === 'black') {
      context.fillStyle = 'rgba(0,0,0,1)';
      context.fillRect(rec.startX, rec.startY, rec.width, rec.height);
    }
    context.rect(rec.startX, rec.startY, rec.width, rec.height);
    context.strokeStyle = rec.color;
    context.lineWidth = 1;
    context.stroke();
  }
  private addDragListenerOnCanvas() {
    let context = this.drawCanvas.getContext('2d');
    let mouseUp = observableFromEvent(this.drawCanvas, 'mouseup');
    let mouseMove = observableFromEvent(this.drawCanvas, 'mousemove');
    let mouseDown = observableFromEvent(this.drawCanvas, 'mousedown');
    let mouseDrag = mouseDown.pipe(mergeMap( (mouseDownEvent: MouseEvent) => {
      if (this.showToolbarTips) {
        this.showToolbarTips = false;
      }
      let newRectangle = new Rectangle();
      newRectangle.startX = mouseDownEvent.offsetX;
      newRectangle.startY = mouseDownEvent.offsetY;
      newRectangle.color = this.drawColor;
      return mouseMove.pipe(
        map((mouseMoveEvent: MouseEvent) => {
          newRectangle.width = mouseMoveEvent.clientX - mouseDownEvent.clientX;
          newRectangle.height = mouseMoveEvent.clientY - mouseDownEvent.clientY;
          return newRectangle;
        }),
        finalize(() => {
          this.rectangles.push(newRectangle);
        }),
        takeUntil(mouseUp));
    }));
    mouseDrag.subscribe(
      (rec) => {
        context.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
        this.drawContainerRec();
        this.rectangles.forEach((tempRec) => {
          this.drawRectangle(context, tempRec);
        });
        this.drawRectangle(context, rec);
      }
    );
  }
}
