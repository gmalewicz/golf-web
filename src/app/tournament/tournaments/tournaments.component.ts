import { Component, OnInit } from '@angular/core';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Tournament } from '@/_models';
import { AuthenticationService} from '@/_services';
import { Router } from '@angular/router';
import { TournamentHttpService } from '../_services';
import { tap } from 'rxjs/internal/operators/tap';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.css']
})
export class TournamentsComponent implements OnInit {

  faSearchPlus: IconDefinition;
  tournaments: Tournament[];
  display: boolean;

  constructor(private tournamentHttpService: TournamentHttpService,
              public authenticationService: AuthenticationService,
              private router: Router) {}

  ngOnInit(): void {

    this.display = false;

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {
      this.faSearchPlus = faSearchPlus;
      this.tournamentHttpService.getTournaments().pipe(
        tap(
          (retTournaments: Tournament[]) => {
            this.tournaments = retTournaments;
            this.display = true;
        })
      ).subscribe();
    }
  }
}
