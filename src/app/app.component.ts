import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  public onSend(val) {
    const w = window.open('about:blank');
    const i = new Image();
    i.src = val.screenshot;
    setTimeout(() => {
      w.document.write(i.outerHTML);
    }, 0);
    console.log(val);
  }
}
