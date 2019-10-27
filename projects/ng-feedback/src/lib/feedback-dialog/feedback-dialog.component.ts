import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { takeUntil, finalize, map, mergeMap } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { Feedback } from '../entity/feedback';
import { Rectangle } from '../entity/rectangle';
import { FeedbackService } from '../feedback.service';

@Component({
  selector: 'feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.css']
})
export class FeedbackDialogComponent implements AfterViewInit {
  public showToolbar = false;
  public vars: object = {};
  public feedback = new Feedback();
  public includeScreenshot: boolean = true;
  public showSpinner = true;
  public screenshotEle: HTMLElement;
  public drawCanvas: HTMLCanvasElement;
  public showToolbarTips: boolean = true;
  @ViewChild('screenshotParent', { static: false })
  public screenshotParent: ElementRef;
  public drawColor: string = this.feedbackService.highlightedColor;
  public rectangles: Rectangle[] = [];
  private scrollWidth = document.documentElement.scrollWidth;
  private scrollHeight = document.documentElement.scrollHeight;
  private elCouldBeHighlighted = ['button', 'a', 'span', 'em', 'i', 'h1', 'h2', 'h3', 'h4',
    'h5', 'h6', 'p', 'strong', 'small', 'sub', 'sup', 'b', 'time', 'img',
    'video', 'input', 'label', 'select', 'textarea', 'article', 'summary', 'section'];
  // the flag field 'isManuallyDrawRect' to solve conflict between manually draw and auto draw
  private manuallyDrawRect$: Subscription;
  private autoDrawRect$: Subscription;
  public isDrawingRect: boolean = false;

  constructor(public dialogRef: MatDialogRef<FeedbackDialogComponent>,
              private feedbackService: FeedbackService,
              private detector: ChangeDetectorRef,
              private el: ElementRef) {
    this.feedback = new Feedback();
    this.feedback.description = '';
    this.vars = this.feedbackService.initialVariables;
  }

  public ngAfterViewInit() {
    this.feedbackService.screenshotCanvas$.subscribe((canvas) => {
      this.showSpinner = false;
      this.feedback.screenshot = canvas.toDataURL('image/png');
      this.screenshotEle = this.feedbackService.getImgEle(canvas);
      this.appendScreenshot();
    });

    this.feedbackService.isDraggingToolbar$.subscribe((isDragging) => {
      if (isDragging) {
        this.destroyCanvasListeners();
      } else {
        this.addCanvasListeners();
      }
    });

    this.dialogRef.afterClosed().subscribe((sendNow) => {
      if (sendNow === true) {
        this.feedbackService.setFeedback(this.feedback);
      }
    });
    this.feedbackService.showBackDrop();
  }

  public expandDrawingBoard() {
    this.showToolbar = true;
    if (!this.drawCanvas) {
      this.detector.detectChanges();
      this.initBackgroundCanvas();
      this.feedbackService.hideBackDrop();
    }
    this.addCanvasListeners();
    this.el.nativeElement.appendChild(this.drawCanvas);
    this.feedbackService.hideBackDrop();
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
      this.showToolbarTips = false;
      this.showSpinner = true;
      this.destroyCanvasListeners();
      this.showToolbar = false;
      this.detector.detectChanges();
      this.feedbackService.initScreenshotCanvas();
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
      this.feedback.screenshot = this.screenshotEle.getAttribute('src');
    } else {
      delete this.feedback['screenshot'];
      this.showSpinner = true;
    }
  }

  private appendScreenshot() {
    if (this.screenshotParent) { this.screenshotParent.nativeElement.appendChild(this.screenshotEle); }
  }

  private initBackgroundCanvas() {
    this.drawCanvas = document.getElementById('draw-canvas') as HTMLCanvasElement;
    // The canvas to draw, must use this way to initial the height and width
    this.drawCanvas.style.height = this.scrollHeight + '';
    this.drawCanvas.style.width = this.scrollWidth + '';
    this.drawCanvas.height = this.scrollHeight;
    this.drawCanvas.width = this.scrollWidth;
    this.drawContainerRect();
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
    context.lineJoin = 'round';
    context.beginPath();
    if (rect.color === this.feedbackService.hiddenColor) {
      context.fillStyle = 'rgba(31, 31, 31, 0.75)';
      context.fillRect(rect.startX, rect.startY, rect.width, rect.height);
      context.rect(rect.startX, rect.startY, rect.width, rect.height);
    } else {
      context.clearRect(rect.startX, rect.startY, rect.width, rect.height);
      context.lineWidth = 5;
      context.strokeStyle = rect.color;
      context.rect(rect.startX, rect.startY, rect.width, rect.height);
      context.stroke();
      context.clearRect(rect.startX, rect.startY, rect.width, rect.height);
      this.rectangles.forEach(tmpRect => {
        if (tmpRect.color === this.feedbackService.highlightedColor) {
          context.clearRect(tmpRect.startX, tmpRect.startY, tmpRect.width, tmpRect.height);
        }
      });
    }
  }

  private addCanvasListeners(): void {
    const mouseUp = fromEvent(document.documentElement, 'mouseup'),
          mouseMove = fromEvent(document.documentElement, 'mousemove'),
          mouseDown = fromEvent(document.documentElement, 'mousedown'),
          scroll = fromEvent(window, 'scroll');

    this.manuallyDrawRect(mouseDown, mouseMove, mouseUp);
    this.autoDrawRect(mouseMove);
    this.changeRectPosition(scroll);
  }

  private changeRectPosition(scroll: Observable<Event>) {
    scroll.subscribe(
      event => {
        const currentWindowScrollX = window.scrollX,
              currentWindowScrollY = window.scrollY;
        this.rectangles.forEach(rect => {
          rect.startY = rect.startY - (currentWindowScrollY - rect.windowScrollY);
          rect.startX = rect.startX - (currentWindowScrollX - rect.windowScrollX);
          rect.windowScrollY = currentWindowScrollY;
          rect.windowScrollX = currentWindowScrollX;
        });
        this.drawPersistCanvasRectangles();
      },
      error => console.error(error)
    );
  }

  private destroyCanvasListeners(): void {
    if (this.manuallyDrawRect$) { this.manuallyDrawRect$.unsubscribe(); }
    if (this.autoDrawRect$) { this.autoDrawRect$.unsubscribe(); }
  }

  private manuallyDrawRect(mouseDown: Observable<Event>, mouseMove: Observable<Event>, mouseUp: Observable<Event>): void {
    const mouseDrag = mouseDown.pipe(mergeMap((mouseDownEvent: MouseEvent) => {
      if (this.showToolbarTips) { this.showToolbarTips = false; }
      this.autoDrawRect$.unsubscribe();
      this.isDrawingRect = true;

      const newRectangle = new Rectangle();
      newRectangle.startX = mouseDownEvent.clientX;
      newRectangle.startY = mouseDownEvent.clientY;
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
            if (rect) { this.rectangles.push(rect); }
          } else {
          // drag to draw rectangle
            if (newRectangle.height < 0) {
              newRectangle.startY = newRectangle.startY + newRectangle.height;
              newRectangle.height = Math.abs(newRectangle.height);
            }
            if (newRectangle.width < 0) {
              newRectangle.startX = newRectangle.startX + newRectangle.width;
              newRectangle.width = Math.abs(newRectangle.width);
            }
            this.rectangles.push(newRectangle);
          }
          this.drawPersistCanvasRectangles();
          this.autoDrawRect(mouseMove);
          this.isDrawingRect = false;
        }),
        takeUntil(mouseUp));
    }));

    this.manuallyDrawRect$ = mouseDrag.subscribe(
      (rec) => {
        this.drawPersistCanvasRectangles();
        this.drawRectangle(rec);
      }
    );
  }

  private autoDrawRect(mouseMove: Observable<Event>): void {
    this.autoDrawRect$ = mouseMove.subscribe({
      next: (mouseMoveEvent: MouseEvent) => {
        this.drawPersistCanvasRectangles();
        this.drawTempCanvasRectangle(mouseMoveEvent);
      },
      error: err => console.error('something wrong occurred: ' + err),
    });
  }

  private drawPersistCanvasRectangles() {
    this.drawContainerRect();
    this.rectangles.forEach(tmpRect => {
      this.drawRectangle(tmpRect);
    });
  }

  private drawTempCanvasRectangle(event: MouseEvent) {
    let rectangle: Rectangle = null;
    const clientX = event.clientX,
          clientY = event.clientY,
          els = document.elementsFromPoint(clientX, clientY),
          el = els[2];
    if ((!this.isExcludeRect(els)) && el && this.elCouldBeHighlighted.indexOf(el.nodeName.toLowerCase()) > -1) {
      rectangle = new Rectangle();
      const rect = el.getBoundingClientRect();
      this.drawCanvas.style.cursor = 'pointer';

      Object.assign(rectangle, {
        startX: rect.left,
        startY: rect.top,
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

  public closeRect(index: number) {
    this.rectangles.splice(index, 1);
    this.drawPersistCanvasRectangles();
  }

  private isExcludeRect(elements: Element[]): boolean {
    const result = elements.some( el => {
      return el.getAttribute('exclude-rect') === 'true';
    });
    return result;
  }
}
