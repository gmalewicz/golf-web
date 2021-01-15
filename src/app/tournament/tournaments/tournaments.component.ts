import { Component, OnInit } from '@angular/core';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Tournament } from '@/_models';
import { AuthenticationService, AlertService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { TournamentHttpService } from '../_services';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.css']
})
export class TournamentsComponent implements OnInit {

  faSearchPlus: IconDefinition;
  tournaments: Array<Tournament>;

  constructor(private tournamentHttpService: TournamentHttpService,
              private authenticationService: AuthenticationService,
              private alertService: AlertService,
              private router: Router) {}

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      this.faSearchPlus = faSearchPlus;
      this.tournamentHttpService.getTournaments().subscribe((retTournaments: Tournament[]) => {
        this.tournaments = retTournaments;
      },
        (error: HttpErrorResponse) => {
          this.alertService.error(error.error.message, false);
      });
    }
  }
}