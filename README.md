# feedback

> An angular directive for sending feedback featuring [Angular 4](https://angular.io), [Html2canvas](html2canvas.hertzen.com), [Angular Material](https://material.angular.io), [Rxjs](http://reactivex.io/rxjs/), inspired by Google send feedback, based on [angular-cli](https://github.com/angular/angular-cli).

## Demo
![Alt text](/../screenshots/feedback.gif?raw=true "overview")

### How to use it in your project
> npm install ng-feedback --save

```bash
# make sure your project have use the angular material and import the BrowserAnimationsModule

# use the feedback module in your project, at any module, you just need to:
```es6
import { FeedbackModule } from 'ng-feedback'
...
imports: [
    FeedbackModule
],
...
```

# then you can use the directive in your module, just add a direct in a tag, such as:
<button feedback>send feedback</button>

```

### options

```bash
* onSend(feedback)
#it is an output of the directive, the usage is:
<button 
  feedback 
  (onSend)="onSend($event)">feedback
</button>
#The param feedback is an object contains two properties: description and screenshot

```

### if you want to modify this repo
**Make sure you have Node version >= 6.0 and NPM >= 3**
> Clone/Download the repo then edit feedback module inside [`/src/app/feedback`](/src/app/feedback)

```bash
# clone repo
git clone https://github.com/RickonChen/feedback.git

# change directory to our repo
cd feedback

# install the repo with npm
npm install

# start the server
npm start

# if you're in China use cnpm
# https://github.com/cnpm/cnpm
```
go to [http://127.0.0.1:4200](http://127.0.0.1:4200) or [http://localhost:4200](http://localhost:4200) in your browser
