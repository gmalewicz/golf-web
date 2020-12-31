import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule} from '@angular/forms';
import { AppComponent } from './app.component';
import { CoursesComponent } from './courses/courses/courses.component';
import { HttpService } from '@/_services';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NavigationComponent } from './navigation/navigation.component';
import { ChartsModule } from 'ng2-charts';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AddCourseComponent } from './add-course/add-course.component';
import { RoundsComponent } from './rounds/rounds.component';
import { AddScorecardComponent } from './add-scorecard/add-scorecard.component';
import { RoundComponent } from './round/round.component';
import { routing } from './app.routing';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AlertComponent } from './alert/alert.component';
import { ErrorInterceptor, JwtInterceptor} from '@/_helpers';
import { RegistrationComponent } from './registration/registration.component';
import { UpdatePlayerComponent } from './update-player/update-player.component';
import { ChangeLogComponent } from './change-log/change-log.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { DropdownModule} from 'primeng/dropdown';
import { RoundViewWHSComponent } from './round-view-whs/round-view-whs.component';
import { RecaptchaModule, RecaptchaFormsModule} from 'ng-recaptcha';
import { FormsModule } from '@angular/forms';
import { RoundViewMPComponent } from './round-view-mp/round-view-mp.component';
import { RoundViewComponent } from './round-view/round-view.component';
import { RoundSummaryComponent } from './round-summary/round-summary.component';
import { CourseComponent } from './course/course.component';
import { ListCoursesComponent } from './courses/list-courses/list-courses.component';

@NgModule({
  declarations: [
    AppComponent,
    CoursesComponent,
    NavigationComponent,
    CourseComponent,
    AddCourseComponent,
    RoundsComponent,
    AddScorecardComponent,
    RoundComponent,
    HomeComponent,
    LoginComponent,
    AlertComponent,
    RegistrationComponent,
    UpdatePlayerComponent,
    ChangeLogComponent,
    ConfirmationDialogComponent,
    RoundViewWHSComponent,
    RoundViewMPComponent,
    RoundViewComponent,
    RoundSummaryComponent,
    ListCoursesComponent,
  ],
  imports: [
    // GamesModule,
    BrowserModule,
    // appRoutingModule,
    routing,
    HttpClientModule,
    ChartsModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    DropdownModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    HttpClientXsrfModule
    // HttpClientXsrfModule.withOptions({
    //  cookieName: 'My-Xsrf-Cookie', // this is optional
    //  headerName: 'My-Xsrf-Header' // this is optional
    // })
  ],
  providers: [HttpService,
              { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
              { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmationDialogComponent]
})
export class AppModule { }
