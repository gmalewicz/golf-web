import { Component, inject, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { Router, Routes, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { mergeMap, tap, catchError } from 'rxjs/operators';
import { AuthenticationService } from '@/_services/authentication.service';
import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { CycleHttpService } from '../cycles/_services/cycleHttp.service';
import { AuthGuard } from '@/_helpers/auth.guard';
import { RoleGuard } from '@/_helpers/role.guard';
import { Course } from '@/_models/course';
import { LoadingDirective } from '@/_helpers/directives/LoadingDirective';

// Eagle API response shapes (external system)
interface EagleStbItem {
  first_name: string;
  last_name: string;
  hcp: number;
  r: number[];
  player_id: number;
  club: string;
}

interface EagleStbResponse {
  items: EagleStbItem[];
}

interface EagleHoleScore {
  number: string;
  par: string;
  strokes: string;
  stb_netto: string;
}

interface EagleScorecardResponse {
  scorecard: {
    rounds: {
      sum: { stb_netto: string };
      holes_out: EagleHoleScore[];
      holes_in: EagleHoleScore[];
    }[];
  };
}

interface HoleData {
  par: number;
  strokes: number;
  points: number;
  si: number;
  notPlayed: boolean;
}

export interface Hcp34Result {
  firstName: string;
  lastName: string;
  playerHcp: number;
  capPlayerHcp: number;
  playingHcp: number;
  playingHcp34: number;
  fullNetto: number;
  netto34: number;
  last9: number;
  last6: number;
  last3: number;
  last1: number;
}

const HCP34_CLUB = 'Royal Golf Club Wilanów';

@Component({
  selector: 'app-hcp34',
  templateUrl: './hcp34.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NgClass, RouterLink, LoadingDirective],
  providers: [CycleHttpService],
})
export class Hcp34Component implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly alertService = inject(AlertService);
  private readonly httpService = inject(HttpService);
  private readonly cycleHttpService = inject(CycleHttpService);

  readonly loading = signal(false);
  readonly searching = signal(false);
  readonly calculated = signal(false);
  readonly results = signal<Hcp34Result[]>([]);
  readonly courseResults = signal<Course[]>([]);
  readonly selectedCourse = signal<Course | null>(null);

  readonly form: FormGroup = this.fb.group({
    tournamentNo: ['', [Validators.required, Validators.pattern('[1-9][0-9][0-9][0-9][0-9]{0,1}')]],
    courseName: [''],
  });

  ngOnInit(): void {
    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch((error) => console.log(error));
    }
  }

  get f() {
    return this.form.controls;
  }

  onCourseKey(): void {
    const name: string = this.f.courseName.value ?? '';
    if (name.length < 3) {
      this.courseResults.set([]);
      return;
    }
    this.searching.set(true);
    this.httpService
      .searchForCourse(name)
      .pipe(
        tap((courses) => {
          this.courseResults.set(courses);
          this.searching.set(false);
        }),
        catchError(() => {
          this.searching.set(false);
          return of([]);
        }),
      )
      .subscribe();
  }

  selectCourse(course: Course): void {
    this.selectedCourse.set(course);
    this.courseResults.set([]);
    this.f.courseName.setValue(course.name);
  }

  calculate(): void {
    const course = this.selectedCourse();

    if (this.form.invalid || course?.id === undefined) {
      this.alertService.error(
        $localize`:@@hcp34-invalid:Provide a valid tournament id and select a course`,
        false,
      );
      return;
    }

    this.loading.set(true);
    this.calculated.set(false);
    let players: EagleStbItem[] = [];

    this.cycleHttpService
      .getEagleStbResults(+this.f.tournamentNo.value, 0)
      .pipe(
        mergeMap((response) => {
          players = ((response as EagleStbResponse)?.items ?? []).filter(
            (item) =>
              item.club === HCP34_CLUB && item.r?.length > 0 && !item.r.every((v) => !v),
          );

          if (players.length === 0) {
            return of(null);
          }

          return forkJoin({
            scorecards: forkJoin(
              players.map((player) => this.cycleHttpService.getScoreCard(player.player_id)),
            ),
            holes: this.httpService.getHoles(course.id!),
          });
        }),
      )
      .subscribe({
        next: (data) => {
          this.loading.set(false);

          if (data === null) {
            this.alertService.error(
              $localize`:@@hcp34-noPlayers:No players with results found for this tournament`,
              false,
            );
            return;
          }

          const siByNumber = new Map<number, number>();
          data.holes.forEach((hole) => siByNumber.set(hole.number, hole.si ?? 0));

          const rows = this.buildResults(
            players,
            data.scorecards as EagleScorecardResponse[],
            siByNumber,
          );

          this.results.set(rows);
          this.calculated.set(true);
        },
        error: () => {
          this.loading.set(false);
          this.alertService.error(
            $localize`:@@hcp34-error:Failed to calculate results`,
            false,
          );
        },
      });
  }

  private buildResults(
    players: EagleStbItem[],
    scorecards: EagleScorecardResponse[],
    siByNumber: Map<number, number>,
  ): Hcp34Result[] {
    const rows: Hcp34Result[] = [];

    players.forEach((player, idx) => {
      const round = scorecards[idx]?.scorecard?.rounds?.[0];
      if (round === undefined) {
        return;
      }

      const holes: HoleData[] = [...round.holes_out, ...round.holes_in].map((hole) => ({
        par: +hole.par,
        strokes: this.parseStrokes(hole.strokes),
        points: +hole.stb_netto,
        si: siByNumber.get(+hole.number) ?? 0,
        notPlayed: this.isNotPlayed(hole.strokes),
      }));

      // competition limit: a player whose handicap exceeds 36 plays off a maximum of 36
      const playingHcp = player.hcp > 36 ? 36 : this.reconstructPlayingHcp(holes);
      const hcp34 = Math.round(playingHcp * 0.75);

      rows.push({
        firstName: player.first_name,
        lastName: player.last_name,
        playerHcp: player.hcp,
        capPlayerHcp: Math.min(player.hcp, 36),
        playingHcp,
        playingHcp34: hcp34,
        fullNetto: +round.sum.stb_netto,
        netto34: this.stablefordForHcp(holes, hcp34),
        last9: this.stablefordForLastHoles(holes, hcp34, 9),
        last6: this.stablefordForLastHoles(holes, hcp34, 6),
        last3: this.stablefordForLastHoles(holes, hcp34, 3),
        last1: this.stablefordForLastHoles(holes, hcp34, 1),
      });
    });

    rows.sort((a, b) => b.netto34 - a.netto34 || b.fullNetto - a.fullNetto);
    return rows;
  }

  // finds the playing handicap that best reproduces the full-HCP stableford points
  private reconstructPlayingHcp(holes: HoleData[]): number {
    let bestHcp = -18;
    let bestMismatch = Number.POSITIVE_INFINITY;

    // negative range covers plus (better than scratch) handicaps
    for (let hcp = -18; hcp <= 54; hcp++) {
      let mismatch = 0;
      for (const hole of holes) {
        const points = this.holePoints(hole, this.strokesReceived(hole.si, hcp));
        if (points !== hole.points) {
          mismatch++;
        }
      }
      // <= keeps the largest handicap among equal fits to recover strokes hidden on blow-up holes
      if (mismatch <= bestMismatch) {
        bestMismatch = mismatch;
        bestHcp = hcp;
      }
    }

    return bestHcp;
  }

  private stablefordForHcp(holes: HoleData[], hcp: number): number {
    return holes.reduce(
      (sum, hole) => sum + this.holePoints(hole, this.strokesReceived(hole.si, hcp)),
      0,
    );
  }

  // tie-break sums: 3/4 stableford net over the final n holes of the round
  private stablefordForLastHoles(holes: HoleData[], hcp: number, n: number): number {
    return this.stablefordForHcp(holes.slice(-n), hcp);
  }

  private strokesReceived(si: number, hcp: number): number {
    if (si <= 0) {
      return 0;
    }
    // floor-based remainder stays in 0..17 for plus handicaps, unlike the % operator;
    // plus players give strokes back on the highest stroke-index (easiest) holes
    const base = Math.floor(hcp / 18);
    const remainder = hcp - base * 18;
    return base + (si <= remainder ? 1 : 0);
  }

  private holePoints(hole: HoleData, received: number): number {
    // a not-played / given-up hole ("x") always scores 0 stableford net
    if (hole.notPlayed) {
      return 0;
    }
    return Math.max(0, 2 + hole.par - (hole.strokes - received));
  }

  private parseStrokes(strokes: string): number {
    // a not-played / given-up hole is marked "x" in the eagle scorecard
    const parsed = +strokes;
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private isNotPlayed(strokes: string): boolean {
    return Number.isNaN(+strokes);
  }
}

export const hcp34Routes: Routes = [
  {
    path: '',
    component: Hcp34Component,
    canActivate: [() => inject(AuthGuard).canActivate(), () => inject(RoleGuard).canActivate('ADMIN')],
  },
];
