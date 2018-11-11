import {from, fromEvent as observableFromEvent, Observable} from 'rxjs';

import {takeUntil, finalize, map, mergeMap, timeout, skipWhile, filter} from 'rxjs/operators';
import {Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener, Renderer2} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {Feedback} from '../entity/feedback';
import {FeedbackService} from '../feedback.service';

import {Rectangle} from '../entity/rectangle';

@Component({
  selector: 'feedback-dialog', // tslint:disable-line
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.css']
})

export class FeedbackDialogComponent implements AfterViewInit {
  public showToolbar = false;
  public title: string = 'Send feedback';
  public descriptionTips: string = 'Describe your issue or share your ideas';
  public feedback = new Feedback();
  public includeScreenshot: boolean = true;
  public showSpinner = true;
  public screenshotEle: HTMLElement;
  public drawCanvas: HTMLCanvasElement;
  public showToolbarTips: boolean = true;
  // switch between toolbar and dialog
  public isSwitching: boolean = false;
  @ViewChild('screenshotParent')
  public screenshotParent: ElementRef;
  public drawColor: string = 'yellow';
  private rectangles: Rectangle[] = [];
  private scrollWidth = window.innerWidth || document.body.clientWidth;
  private scrollHeight = window.innerHeight || document.body.clientHeight;
  private elCouldBeHighlighted = ['button', 'a', 'span', 'em', 'i', 'h1', 'h2', 'h3', 'h4',
    'h5', 'h6', 'p', 'strong', 'small', 'sub', 'sup', 'b', 'time', 'img',
    'video', 'input', 'label', 'select', 'textarea', 'article', 'summary', 'section'];
  // the flag field 'isManuallyDrawRect' to solve conflict between manually draw and auto draw
  private isManuallyDrawRect: boolean = false;

  constructor(public dialogRef: MatDialogRef<FeedbackDialogComponent>,
              private feedbackService: FeedbackService,
              private detector: ChangeDetectorRef,
              private el: ElementRef) {
    this.feedback = new Feedback();
    this.feedback.description = '';
  }

  public ngAfterViewInit() {
    this.feedbackService.screenshotCanvas$.subscribe(
      (canvas) => {
        this.showSpinner = false;
        this.feedback.screenshot = canvas.toDataURL('image/png');
        this.screenshotEle = this.feedbackService.getImgEle(canvas);
        this.appendScreenshot();
      }
    );

    this.dialogRef.afterClosed().subscribe((sendNow) => {
      if (sendNow === true) {
        this.feedbackService.setFeedback(this.feedback);
      }
    });
    this.showBackDrop();
  }

  public expandDrawingBoard() {
    this.showToolbar = true;
    if (!this.drawCanvas) {
      this.initBackgroundCanvas();
    }
    this.el.nativeElement.appendChild(this.drawCanvas);
    this.hideBackDrop();
    console.log('expand the board');
  }

  private hideBackDrop() {
    const dialogBackDrop = document.getElementsByClassName('dialogBackDrop')[0] as HTMLElement;
    dialogBackDrop.style.backgroundColor = 'initial';
  }

  private showBackDrop() {
    const dialogBackDrop = document.getElementsByClassName('dialogBackDrop')[0] as HTMLElement;
    if (!dialogBackDrop.getAttribute('data-html2canvas-ignore')) {
      dialogBackDrop.setAttribute('data-html2canvas-ignore', 'true');
    }
    dialogBackDrop.style.backgroundColor = 'rgba(0, 0, 0, .288)';
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
      this.showToolbar = false;
      this.showToolbarTips = false;
      this.isSwitching = true;
      this.showSpinner = true;
      this.el.nativeElement.removeChild(this.drawCanvas);
      setTimeout(() => {
        this.feedbackService.initScreenshotCanvas();
        this.showBackDrop();
        this.isSwitching = false;
      });
    } else {
      this.startDraw(manipulation);
    }
  }

  public startDraw(color: string) {
    this.drawColor = color;
  }

  public isIncludeScreenshot() {
    if (this.includeScreenshot) {
      this.detector.detectChanges();
      this.showSpinner = false;
      this.appendScreenshot();
    } else {
      this.showSpinner = true;
    }
  }

  private appendScreenshot() {
    this.screenshotParent.nativeElement.appendChild(this.screenshotEle);
  }

  private initCanvasStyle(canvas: HTMLElement) {
    const style = canvas.style;
    Object.assign(style, {
      position: 'absolute',
      top: '0',
      left: '0',
      zIndex: '-1',
      height: '100%',
      width: '100%',
      margin: '0 auto',
      cursor: 'crosshair'
    });
  }

  private initBackgroundCanvas() {
    this.drawCanvas = document.createElement('canvas');
    this.initCanvasStyle(this.drawCanvas);
    // The canvas to draw, must use this way to initial the height and width
    this.drawCanvas.height = this.scrollHeight;
    this.drawCanvas.width = this.scrollWidth;
    this.drawContainerRect();
    this.addDragListenerOnCanvas();
  }

  private drawContainerRect() {
    const drawContext = this.drawCanvas.getContext('2d'),
      width = this.scrollWidth,
      height = this.scrollHeight;
    drawContext.beginPath();
    drawContext.fillStyle = 'rgba(0,0,0,0.3)';
    drawContext.clearRect(0, 0, width, height);
    drawContext.fillRect(0, 0, width, height); // draw the rectangle
  }

  private drawRectangle(rect: Rectangle) {
    const context = this.drawCanvas.getContext('2d');
    context.clearRect(rect.startX, rect.startY, rect.width, rect.height);
    context.beginPath();
    if (rect.color === 'black') {
      context.fillStyle = 'rgba(0,0,0, .7)';
      context.fillRect(rect.startX, rect.startY, rect.width, rect.height);
      context.strokeStyle = 'rgba(0,0,0, .7)';
    } else {
      context.strokeStyle = rect.color;
    }
    context.rect(rect.startX, rect.startY, rect.width, rect.height);
    context.lineWidth = 1;
    context.stroke();
  }

  private addDragListenerOnCanvas() {
    const mouseUp = observableFromEvent(this.drawCanvas, 'mouseup'),
          mouseMove = observableFromEvent(this.drawCanvas, 'mousemove'),
          mouseDown = observableFromEvent(this.drawCanvas, 'mousedown');

    this.manuallyDrawRect(mouseDown, mouseMove, mouseUp);
    this.autoDrawRect(mouseMove);
  }

  private manuallyDrawRect(mouseDown: Observable<Event>, mouseMove: Observable<Event>, mouseUp: Observable<Event>) {
    const context = this.drawCanvas.getContext('2d');
    const mouseDrag = mouseDown.pipe(mergeMap((mouseDownEvent: MouseEvent) => {
      if (this.showToolbarTips) {
        this.showToolbarTips = false;
      }
      this.isManuallyDrawRect = true;
      const newRectangle = new Rectangle();
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
          // click to draw rectangle
          if (newRectangle.width === undefined || newRectangle.height === undefined ||
            newRectangle.width === 0 || newRectangle.height === 0) {
            const rect = this.drawTempCanvasRectangle(mouseDownEvent);
            if (rect) {
              this.rectangles.push(rect);
            }
          } else {
          // drag to draw rectangle
            this.rectangles.push(newRectangle);
          }
          this.drawPersistCanvasRectangles();
          this.isManuallyDrawRect = false;
        }),
        takeUntil(mouseUp));
    }));

    mouseDrag.subscribe(
      (rec) => {
        this.drawPersistCanvasRectangles();
        this.drawRectangle(rec);
      }
    );
  }

  private autoDrawRect(mouseMove: Observable<Event>) {
    mouseMove.subscribe({
      next: (mouseMoveEvent: MouseEvent) => {
        if (this.isManuallyDrawRect === false) {
          this.drawPersistCanvasRectangles();
          this.drawTempCanvasRectangle(mouseMoveEvent);
        }
      },
      error: err => console.error('something wrong occurred: ' + err),
    });
  }

  private drawPersistCanvasRectangles() {
    this.drawContainerRect();
    const context = this.drawCanvas.getContext('2d');
    this.rectangles.forEach(tmpRect => {
      this.drawRectangle(tmpRect);
    });
  }

  private drawTempCanvasRectangle(event: MouseEvent) {
    let rectangle: Rectangle = null;
    const clientX = event.clientX,
          clientY = event.clientY,
          el = document.elementsFromPoint(clientX, clientY)[2];
    if (el && this.elCouldBeHighlighted.indexOf(el.nodeName.toLowerCase()) > -1) {
      rectangle = new Rectangle();
      const rect = el.getBoundingClientRect();
      this.drawCanvas.style.cursor = 'pointer';

      Object.assign(rectangle, {
        startX: rect.left + (document.documentElement.scrollLeft + document.body.scrollLeft),
        startY: rect.top + (document.documentElement.scrollTop + document.body.scrollTop),
        width: rect.width,
        height: rect.height,
        color: this.drawColor
      });
      this.drawRectangle(rectangle);
    } else {
      this.drawCanvas.style.cursor = 'crosshair';
    }
    return rectangle;
  }
}
