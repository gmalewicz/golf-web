import { Component, OnInit} from '@angular/core';
import { HttpService, AlertService, AuthenticationService } from '@/_services';
import { Round } from '@/_models';
import { Router} from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'app-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class RoundComponent implements OnInit {

  dialogRef: MatDialogRef<ConfirmationDialogComponent>;

  loading: boolean;
  display: boolean;
  round: Round;

  selectedTab: number;

  constructor(private httpService: HttpService,
              private alertService: AlertService,
              private router: Router,
              private authenticationService: AuthenticationService,
              public dialog: MatDialog) {

  }

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      this.round = history.state.data.round;

      this.httpService.getScoreCards(this.round.id).pipe(tap(
        (retScoreCards) => {

          this.round.scoreCard = retScoreCards;
          this.round.player = [];

          for (let idx = 0; idx < retScoreCards.length; idx += 18) {
            this.round.player.push(retScoreCards[idx].player);
          }
          this.display = true;
          this.selectedTab = 0;
        })
      ).subscribe();
    }
  }

  onDelete() {
    // console.log('delete executed');
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete score card?';
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // do confirmation actions
        this.loading = true;
        this.httpService.deleteScoreCard(this.authenticationService.currentPlayerValue.id, this.round.id).pipe(tap(
          () => {
            this.loading = false;
            this.alertService.success('The scorecard has been successfully deleted', true);
            this.router.navigate(['/']);
          })
        ).subscribe();
      }
      this.dialogRef = null;
    });
  }

  onEdit() {

    // prepare data to pass to ad-scorecard module
    // this.round.course.holes = this.holes;
    this.round.player = [];
    this.round.player.push(this.authenticationService.currentPlayerValue);
    // remove rounds for all other players
    this.round.scoreCard = this.round.scoreCard.filter((s, i) => s.player.id === this.authenticationService.currentPlayerValue.id);
    this.router.navigate(['/addScorecard/' + this.round.course.id + '/' +
      this.round.course.name + '/' +
      this.round.course.par], {
      state: { data: { round: this.round } }
    });

  }

  onTabClick(tab: number) {
    this.selectedTab = tab;
  }
}
