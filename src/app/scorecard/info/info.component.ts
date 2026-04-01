import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { NavigationService } from '../_services/navigation.service';
import { OnlineRound } from '../_models';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { Format } from '@/_models/format';
import { MPLegendComponent } from '@/_helpers/mpLegend.component';

@Component({
  selector: 'app-info',
  imports: [ MatButton, MPLegendComponent],
  providers: [NavigationService],
  standalone: true,
  templateUrl: './info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent {
  private readonly router = inject(Router);
  protected navigationService = inject(NavigationService);
 

  Format = Format;

  onlineRounds: OnlineRound[];

  constructor() {
    this.onlineRounds = this.router.currentNavigation()?.extras.state?.['onlineRounds'];
  }

  onBack(): void {  

    this.navigationService.setCourseSgn(signal(this.onlineRounds[0].course));
    this.navigationService.setOnlineRoundsSgn(signal(this.onlineRounds));

    switch (this.onlineRounds[0].format) {
      case Format.MATCH_PLAY:
        this.router.navigate(['/scorecard/onlineMatchplay']).catch(error => console.log(error));
        break;
      case Format.FOUR_BALL_MATCH_PLAY:
        this.router.navigate(['/scorecard/onlineFbMatchplay']).catch(error => console.log(error));
        break;
      case Format.FOUR_BALL_STROKE_PLAY:
        this.router.navigate(['/scorecard/onlineFbStrokeplay']).catch(error => console.log(error));
        break;
      default:
        this.router.navigate(['/scorecard/onlineStrokeplay']).catch(error => console.log(error));
        break;
    }
  }
} 
