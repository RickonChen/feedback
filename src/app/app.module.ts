import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material';
import { NgxMdFeedbackModule } from 'projects/ngx-md-feedback/src/public_api';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    NgxMdFeedbackModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
