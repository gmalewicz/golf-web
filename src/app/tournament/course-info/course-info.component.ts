import { Course } from '@/_models/course';
import { ChangeDetectionStrategy, Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentNavigationService } from '../_services/tournamentNavigation.service';
import { HttpService } from '@/_services';
import { tap } from 'rxjs';
import { teeTypes } from '@/_models';
import { calculateRoundedCourseHCP } from '@/_helpers/whs.routines';

@Component({
  selector: 'app-course-info',
  imports: [],
  templateUrl: './course-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseInfoComponent implements OnInit {
  private readonly router = inject(Router);
  readonly navigationService = inject(TournamentNavigationService);
  private readonly httpService = inject(HttpService);
 

  readonly PARENT_TOURNAMENT = 'tournament'; 

  courseSgn = signal<Course>(undefined);
  parentSgn = signal<string>(undefined);
  playerTeesSgn = signal<PlayerTee[]>(undefined);

  ngOnInit(): void {
  
    if (history.state.data === undefined || 
        history.state.data.course === undefined || 
        history.state.data.parent === undefined) {
      this.router.navigate(['/home']).catch(error => console.log(error));
    } else {
      this.courseSgn.set(history.state.data.course);
      this.parentSgn.set(history.state.data.parent);
 
      // load tees
      this.httpService.getTees(this.courseSgn().id).pipe(
        tap((tees) => {
          if (this.parentSgn() === this.PARENT_TOURNAMENT) {
            const playerTees: PlayerTee[] = [];
            this.navigationService.tournamentPlayers().forEach(player => {
              let playerNameNotSet = true;
              tees.forEach(tee => {
                if (tee.sex === player.sex && tee.teeType === teeTypes.TEE_TYPE_18) {
                  const courseHcp = calculateRoundedCourseHCP(tee.teeType, player.whs, tee.sr, tee.cr, this.courseSgn().par);
                  playerTees.push({
                    nick: playerNameNotSet ? player.nick : "",
                    hcp: player.whs,  
                    sr: tee.sr, 
                    cr: tee.cr,
                    tee: tee.tee,
                    courseHcp: courseHcp,
                    playingHcp: Math.round(courseHcp * this.navigationService.tournament().playHcpMultiplayer)
                  });
                  playerNameNotSet = false;
                }  
              })
            })
            this.playerTeesSgn.set(playerTees);
          }
        })
      ).subscribe();
    }
  }

  onCancel() {
    this.router.navigate(['tournaments/tournamentResults']).catch(error => console.log(error));
  }
}

interface PlayerTee {
  nick?: string,
  hcp: number,
  sr: number,
  cr: number,
  tee: string,
  courseHcp: number,
  playingHcp: number
}
