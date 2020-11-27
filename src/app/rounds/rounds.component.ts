import { Component, OnInit } from '@angular/core';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Round } from '@/_models';
import { HttpService, AuthenticationService, AlertService} from '@/_services';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-rounds',
  templateUrl: './rounds.component.html',
  styleUrls: ['./rounds.component.css']
})
export class RoundsComponent implements OnInit {

  faSearchPlus: IconDefinition;
  rounds: Array<Round>;
  display: boolean;
  page: number;
  pageSize: number;

  constructor(private httpService: HttpService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private alertService: AlertService) {
  }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      // initialize the current page
      this.page = 0;
      this.pageSize = 5;
      this.display = false;

      this.faSearchPlus = faSearchPlus;
      // console.log('rounds requested');

      this.getRounds();
    }
  }

  onNext() {
    if (this.rounds.length === this.pageSize) {
      this.page++;
      this.getRounds();
    }
  }

  onPrevious() {
    if (this.page > 0) {
      this.page--;
      this.getRounds();
    }
  }

  private getRounds(): void {
    this.httpService.getRounds(this.authenticationService.currentPlayerValue.id, this.page).subscribe((retRounds: Round[]) => {
      // console.log(retRounds);
      this.rounds = retRounds;
      this.display = true;
    },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.message, true);
        this.router.navigate(['/']);
    });
  }
}
