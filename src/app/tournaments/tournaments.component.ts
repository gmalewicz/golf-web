import { Component, OnInit } from '@angular/core';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { Tournament } from '@/_models';
import { HttpService, AuthenticationService, AlertService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.css']
})
export class TournamentsComponent implements OnInit {

  faSearchPlus = faSearchPlus;
  tournaments: Array<Tournament>;

  constructor(private httpService: HttpService,
              private authenticationService: AuthenticationService,
              private alertService: AlertService,
              private router: Router) {

    // to do
    this.httpService.getTournaments().subscribe((retTournaments: Tournament[]) => {
      this.tournaments = retTournaments;
    },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.message, false);
    });
  }

  ngOnInit(): void {
  }
}
