import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { Subject } from 'rxjs';
@Injectable()
export class FeedbackService {
  private screenshotCanvasSource = new Subject<any>();
  public screenshotCanvas$ = this.screenshotCanvasSource.asObservable();
  private feedbackSource = new Subject();
  public feedback$ = this.feedbackSource.asObservable();

  public initScreenshotCanvas(wholehtml) {
    html2canvas(wholehtml).then(canvas => { this.screenshotCanvasSource.next(canvas); });
  }

  public setCanvas(canvas) {
    this.screenshotCanvasSource.next(canvas);
  }

  public setFeedback(feedback) {
    this.feedbackSource.next(feedback);
  }
  public getImgEle(canvas) {
    let img = canvas.toDataURL('image/png');
    let imageEle = document.createElement('img');
    imageEle.setAttribute('src', img);
    imageEle.style.position = 'absolute';
    imageEle.style.lineHeight = 'normal';
    imageEle.style.display = 'inline-block';
    imageEle.style.top = '0';
    imageEle.style.left = '0';
    imageEle.style.width = '100%';
    imageEle.style.height = '100%';
    imageEle.style.zIndex = '2';
    imageEle.style.margin = '0 auto';
    return imageEle;
  }
}
