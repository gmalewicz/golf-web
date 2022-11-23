import { AuthenticationService } from './../_services/authentication.service';
import { NavigationService } from './_services/navigation.service';
import { CommonScorecardComponent } from './common-scorecard/common-scorecard.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlineRoundDefComponent } from './online-round-def/online-round-def.component';
import { OnlineRoundComponent } from './online-round/online-round.component';
import { OnlineScoreCardViewComponent } from './online-score-card-view/online-score-card-view.component';
import { OnlineScoreCardComponent } from './online-score-card/online-score-card.component';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';
import { ScorecardHttpService } from './_services/scorecardHttp.service';
import { routing } from './scorecard.routing';
import { DropdownModule } from 'primeng/dropdown';
import { OnlineMatchplayComponent } from './online-matchplay/online-matchplay.component';
import { OnlineNavComponent } from './online-nav/online-nav.component';
import { RegisterPlayerDialogComponent } from './register-player-dialog/register-player-dialog.component';
import { UpdateWhsDialogComponent } from './update-whs-dialog/update-whs-dialog.component';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { CommonDialogComponent } from './common-dialog/common-dialog.component';
import { CommonScorecardTopComponent } from './common-scorecard-top/common-scorecard-top.component';
import { SessionRecoveryInterceptor } from '@/_helpers/session.interceptor';
import { RxStompService } from './_services/rx-stomp.service';
import { rxStompServiceFactory } from './_services/rx-stomp-service-factory';

@NgModule({
  declarations: [
    OnlineScoreCardComponent,
    OnlineRoundComponent,
    OnlineScoreCardViewComponent,
    OnlineRoundDefComponent,
    OnlineMatchplayComponent,
    OnlineNavComponent,
    RegisterPlayerDialogComponent,
    UpdateWhsDialogComponent,
    CommonDialogComponent,
    CommonScorecardComponent,
    CommonScorecardTopComponent
  ],
  imports: [
    routing,
    DropdownModule,
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    HttpClientModule,
    HttpClientXsrfModule,
    MatInputModule,
    MatCheckboxModule,
    MatDialogModule,
  ],
  providers: [ScorecardHttpService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SessionRecoveryInterceptor, multi: true },
    { provide: RxStompService, useFactory: rxStompServiceFactory, deps: [AuthenticationService]},
    NavigationService
  ],
  exports: [],
  entryComponents: [RegisterPlayerDialogComponent, UpdateWhsDialogComponent]
})
export class ScorecardModule { }
