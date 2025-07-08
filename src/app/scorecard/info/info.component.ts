import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NavigationService } from '../_services/navigation.service';
import { OnlineRound } from '../_models';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-info',
  imports: [ MatButton],
  providers: [NavigationService],
  standalone: true,
  templateUrl: './info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoComponent { 

  onlineRounds: OnlineRound[];

  constructor(private readonly router: Router,  protected navigationService: NavigationService,
  ) {
    this.onlineRounds = this.router.getCurrentNavigation()?.extras.state?.['onlineRounds'];
  }

  onBack(): void {  

    this.navigationService.setCourseSgn(signal(this.onlineRounds[0].course));
    this.navigationService.setOnlineRoundsSgn(signal(this.onlineRounds));

    if (this.onlineRounds[0].matchPlay) {
      this.router.navigate(['/scorecard/onlineMatchplay']).catch(error => console.log(error));
    } else {
      this.router.navigate(['/scorecard/onlineRound']).catch(error => console.log(error));
    }
  
  }
} 
