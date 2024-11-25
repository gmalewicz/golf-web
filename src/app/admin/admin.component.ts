import { PlayerRndCnt } from '@/_models/playerRndCnt';
import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {

  playerRound: PlayerRndCnt[];

  @ViewChild('adminContainer', {read: ViewContainerRef}) adminContainerRef: ViewContainerRef;

  constructor(
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.loadComponent(0).catch(error => console.log(error));
    }
  }

  async loadComponent(comp: number) {

    if (this.adminContainerRef !== undefined) {
      this.adminContainerRef.clear();
    }

    if (comp === 0) {
      const {ResetPasswordComponent} = await import('./reset-password/reset-password.component');
      this.adminContainerRef.createComponent(ResetPasswordComponent);
    } else if (comp === 1){
      const {MoveCourseComponent} = await import('./move-course/move-course.component');
      this.adminContainerRef.createComponent(MoveCourseComponent);
    } else if (comp === 2) {
      const {UpdRoundHcpComponent} = await import('./upd-round-hcp/upd-round-hcp.component');
      this.adminContainerRef.createComponent(UpdRoundHcpComponent);
    } else if (comp === 3) {
      const {PlayersComponent} = await import('./players/players.component');
      const ref = this.adminContainerRef.createComponent(PlayersComponent);
      const playerComponent = ref.instance;
      if (this.playerRound !=  null) {
        playerComponent.playerRound = this.playerRound;
      }

      playerComponent.playerRoundCntEmt.pipe(
        tap(
          pr => {
            this.playerRound = pr;
          })
      ).subscribe();
    } else if (comp === 4) {
      const {UpdPlayerRndComponent} = await import('./upd-player-rnd/upd-player-rnd.component');
      this.adminContainerRef.createComponent(UpdPlayerRndComponent);
    }
  }
}
