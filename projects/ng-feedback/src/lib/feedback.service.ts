import {Injectable} from '@angular/core';
import html2canvas from 'html2canvas';
import {Subject, Observable} from 'rxjs'; // import Observable to solve build issue

@Injectable()
export class FeedbackService {
  private screenshotCanvasSource = new Subject<any>();
  public screenshotCanvas$ = this.screenshotCanvasSource.asObservable();
  private feedbackSource = new Subject();
  public feedback$ = this.feedbackSource.asObservable();

  public initScreenshotCanvas() {
    const that = this;
    const body = document.body;
    html2canvas(body, {
      canvas: that.generateExistingCanvas(),
      logging: false,
      width: window.innerWidth,
      height: window.innerHeight,
      x: document.documentElement.scrollLeft || document.body.scrollLeft,
      y: document.documentElement.scrollTop || document.body.scrollTop,
      allowTaint : true
    }).then(bodyCanvas => {
      this.screenshotCanvasSource.next(bodyCanvas);
    });
  }

  private generateExistingCanvas() {
    const scale = 5;
    const w = document.body.offsetWidth;
    const h = document.body.offsetHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.getContext('2d').scale(scale, scale);
    return canvas;
  }

  public setCanvas(canvas) {
    this.screenshotCanvasSource.next(canvas);
  }

  public setFeedback(feedback) {
    this.feedbackSource.next(feedback);
  }

  public getImgEle(canvas) {
    const img = canvas.toDataURL('image/png'),
          imageEle = document.createElement('img');
    imageEle.setAttribute('src', img);
    Object.assign(imageEle.style, {
      position: 'absolute',
      top: '50%',
      right: '0',
      left: '0',
      margin: '0 auto',
      maxHeight: '100%',
      maxWidth: '100%',
      transform: 'translateY(-50%)'
    });
    return imageEle;
  }
}
