import { AuthenticationService } from './../_services/authentication.service';
import { NavigationService } from './_services/navigation.service';
import { CommonScorecardComponent } from './common-scorecard/common-scorecard.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlineRoundDefComponent } from './online-round-def/online-round-def.component';
import { OnlineRoundComponent } from './online-round/online-round.component';
import { OnlineScoreCardViewComponent } from './online-score-card-view/online-score-card-view.component';
import { OnlineScoreCardComponent } from './online-score-card/online-score-card.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ErrorInterceptor } from '@/_helpers';
import { ScorecardHttpService } from './_services/scorecardHttp.service';
import { routing } from './scorecard.routing';
import { OnlineMatchplayComponent } from './online-matchplay/online-matchplay.component';
import { OnlineNavComponent } from './online-nav/online-nav.component';
import { UpdateWhsDialogComponent } from './update-whs-dialog/update-whs-dialog.component';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { CommonScorecardTopComponent } from './common-scorecard-top/common-scorecard-top.component';
import { SessionRecoveryInterceptor } from '@/_helpers/session.interceptor';
import { RxStompService } from './_services/rx-stomp.service';
import { rxStompServiceFactory } from './_services/rx-stomp-service-factory';
import { PlayerDataInterceptor } from '@/_helpers/playerData.interceptor';
import { RegisterPlayerDialogComponent } from '@/dialogs/register-player-dialog/register-player-dialog.component';
import { CommonDialogComponent } from '@/dialogs/common-dialog/common-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';


@NgModule({ exports: [], imports: [routing,
        CommonModule,
        ReactiveFormsModule,
        FontAwesomeModule,
        MatInputModule,
        MatDialogModule,
        MatSelectModule,
        MatButtonModule,
        MatCheckboxModule,
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
        CommonScorecardTopComponent], providers: [ScorecardHttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: SessionRecoveryInterceptor, multi: true },
        { provide: RxStompService, useFactory: rxStompServiceFactory, deps: [AuthenticationService, ScorecardHttpService] },
        { provide: HTTP_INTERCEPTORS, useClass: PlayerDataInterceptor, multi: true },
        NavigationService, provideHttpClient(withInterceptorsFromDi())] })
export class ScorecardModule { }


