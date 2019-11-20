import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  
  public onSend(val) {
    console.log(val);
  }

  public onCanceled() {
    console.log('Feedback canceled')
  }
}
