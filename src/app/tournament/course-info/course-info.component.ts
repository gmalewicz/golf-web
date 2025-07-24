import { Course } from '@/_models/course';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TournamentNavigationService } from '../_services/tournamentNavigation.service';
import { HttpService } from '@/_services';
import { tap } from 'rxjs';
import { teeTypes } from '@/_models';
import { calculateCourseHCP } from '@/_helpers';

@Component({
  selector: 'app-course-info',
  imports: [],
  templateUrl: './course-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseInfoComponent implements OnInit { 

  readonly PARENT_TOURNAMENT = 'tournament'; 

  courseSgn = signal<Course>(undefined);
  parentSgn = signal<string>(undefined);
  playerTeesSgn = signal<playerTee[]>(undefined);

  constructor(private readonly router: Router,
              public readonly navigationService: TournamentNavigationService,
              private readonly httpService: HttpService) { }

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
            let playerTees: playerTee[] = [];
            this.navigationService.tournamentPlayers().forEach(player => {
              let playerNameNotSet = true;
              tees.forEach(tee => {
                if (tee.sex === player.sex && tee.teeType === teeTypes.TEE_TYPE_18) {
                  let courseHcp = calculateCourseHCP(tee.teeType, player.whs, tee.sr, tee.cr, this.courseSgn().par);
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

interface playerTee {
  nick?: string,
  hcp: number,
  sr: number,
  cr: number,
  tee: string,
  courseHcp: number,
  playingHcp: number
}
