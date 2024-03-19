import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { MatDialogModule } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { routing } from './app/app.routing';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { RoundsNavigationService } from './app/rounds/roundsNavigation.service';
import { provideCharts, withDefaultRegisterables, BaseChartDirective } from 'ng2-charts';
import { PlayerDataInterceptor } from './app/_helpers/playerData.interceptor';
import { SessionRecoveryInterceptor } from './app/_helpers/session.interceptor';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient, HttpClientXsrfModule } from '@angular/common/http';
import { HttpService } from '@/_services';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, BaseChartDirective, FontAwesomeModule, FormsModule, ReactiveFormsModule, MatDialogModule, RecaptchaModule, RecaptchaFormsModule, HttpClientXsrfModule, MatInputModule, MatCheckboxModule, MatButtonModule, MatSelectModule),
        HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: SessionRecoveryInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: PlayerDataInterceptor, multi: true },
        provideCharts(withDefaultRegisterables()),
        RoundsNavigationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideRouter(routing, withPreloading(PreloadAllModules)),
    ]
})
  .catch(err => console.error(err));
