# feedback

> An angular directive for sending feedback featuring [Angular 4](https://angular.io), [Html2canvas](html2canvas.hertzen.com), [Angular Material](https://material.angular.io), [Rxjs](http://reactivex.io/rxjs/), inspired by Google send feedback, based on [angular-cli](https://github.com/angular/angular-cli).

## Demo
![Alt text](/../screenshots/feedback.gif?raw=true "overview")


### Prerequisites
make sure your project:
* is an angular(version >= 4.0.0) project
* have set up [angular material](https://github.com/angular/material2/blob/master/guides/getting-started.md)

### How to use it in your project
> download it from npm

```bash
npm install ng-feedback --save
```

use the feedback module in your project, at any module, you just need to imports into your module:
```es6
import { FeedbackModule } from 'ng-feedback'
```

easy to use the directive, just add it in a html tag, such as:
```
<button feedback>feedback</button>
```

### options

```
onSend(feedback)
```

it is an output of the directive, the usage is:

```
<button 
  feedback 
  (onSend)="onSend($event)">feedback
</button>
```
Then you can custom the onSend method in your component.
The param feedback is an object contains two properties: description and screenshot.
* description is string to describe issues or ideas
* screenshot comes from HTMLCanvasElement.toDataURL('image/png'), can be used as src of an img tag.

### Getting started with this repo
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
