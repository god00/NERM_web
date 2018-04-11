import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from './home/home.component';
import { CreateModelComponent } from './create-model/create-model.component';

import { DatabaseService } from './services/database.service';
import { FileUploadService } from './services/fileupload.service';
import { AuthenticationService } from './services/authentication.service';

import { AuthGuard } from './guard/auth.guard';




const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginPageComponent },
  { path: 'create', component: CreateModelComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    HomeComponent,
    CreateModelComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { useHash: true }),
    NgbModule.forRoot(),
    ReactiveFormsModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,
    }),
    HttpClientModule,
    FormsModule,
  ],
  providers: [
    DatabaseService,
    AuthenticationService,
    AuthGuard,
    FileUploadService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
