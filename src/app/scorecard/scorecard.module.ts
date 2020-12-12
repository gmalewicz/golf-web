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



@NgModule({
  declarations: [
    OnlineScoreCardComponent,
    OnlineRoundComponent,
    OnlineScoreCardViewComponent,
    OnlineRoundDefComponent,
    OnlineMatchplayComponent
  ],
  imports: [
    routing,
    DropdownModule,
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    HttpClientModule,
    HttpClientXsrfModule
  ],
  providers: [ScorecardHttpService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  exports: []
})
export class ScorecardModule { }
