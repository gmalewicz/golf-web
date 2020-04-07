import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AppComponent } from './app.component';
import { CoursesComponent } from './courses/courses.component';
import { HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NavigationComponent } from './navigation/navigation.component';
import { CourseComponent } from './course/course.component';
import { ChartsModule } from 'ng2-charts';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AddCourseComponent } from './add-course/add-course.component';
import { RoundsComponent } from './rounds/rounds.component';
import { AddScorecardComponent } from './add-scorecard/add-scorecard.component';
import { RoundComponent } from './round/round.component';
import { appRoutingModule } from './app.routing';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AlertComponent } from './alert/alert.component';
import { ErrorInterceptor, JwtInterceptor} from '@/_helpers';
import { RegistrationComponent } from './registration/registration.component';
import { UpdatePlayerComponent } from './update-player/update-player.component';


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
    UpdatePlayerComponent
  ],
  imports: [
    BrowserModule,
    appRoutingModule,
    HttpClientModule,
    ChartsModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [HttpService,
              { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
              { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
