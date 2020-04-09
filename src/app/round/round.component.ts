import { Component, OnInit } from '@angular/core';
import { ChartType, ChartDataSets, ChartOptions } from 'chart.js';
import { HttpService, AlertService } from '@/_services';
import { Round } from '@/_models';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';


@Component({
  selector: 'app-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class RoundComponent implements OnInit {

  display = false;
  round: Round;

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartLabels: number[] = [];
  public barChartData: ChartDataSets[];
  public barChartOptions: ChartOptions;

  strokes: Array<Array<number>> = [];
  pats: Array<Array<number>> = [];
  par: number[] = [];

  constructor(private httpService: HttpService, private alertService: AlertService, private router: Router) {
    this.round = history.state.data.round;
    this.showRound();
  }

  ngOnInit(): void {

  }

  showRound() {

    console.log('strokes: ' + this.strokes);
    console.log('pats: ' + this.pats);
    console.log('par: ' + this.par);

    combineLatest([this.httpService.getScoreCards(
      this.round.id), this.httpService.getHoles(this.round.course.id)]).subscribe(([retScoreCards, retHoles]) => {
        console.log(retScoreCards.length);

        for (let score = 0; score < retScoreCards.length; score++) {

          if (score % 18 === 0) {
            console.log('create set');
            this.strokes.push([]);
            this.pats.push([]);
          }
          this.strokes[Math.floor(score / 18)].push(retScoreCards[score].stroke);
          this.pats[Math.floor(score / 18)].push(retScoreCards[score].pats);
        }

        console.log(this.strokes);

        console.log(retHoles);
        for (let hole = 0; hole < 18; hole++) {
          this.par.push(retHoles[hole].par);
          this.barChartLabels.push(hole + 1);
        }

        this.generateLabelsAndData();
        this.display = true;
      });
  }

  generateLabelsAndData() {
    console.log(this.strokes);
    this.barChartData = [{ stack: 'Stack 0', label: 'Par', data: this.par, backgroundColor: 'purple', borderWidth: 1 }];
    console.log(this.strokes.length);
    if (this.strokes.length > 0) {
      this.barChartData.push({ stack: 'Stack 1', label: 'Strokes', data: this.strokes[0], backgroundColor: '#F8A82F', borderWidth: 1 });
      this.barChartData.push({ stack: 'Stack 1', label: 'Puts', data: this.pats[0], backgroundColor: '#B0956D', borderWidth: 1 });
    }
    if (this.strokes.length > 1) {
      this.barChartData.push({ stack: 'Stack 2', label: 'Strokes', data: this.strokes[1], backgroundColor: '#23F45F', borderWidth: 1 });
      this.barChartData.push({ stack: 'Stack 2', label: 'Puts', data: this.pats[1], backgroundColor: '#6EA47E', borderWidth: 1 });
    }
    if (this.strokes.length > 2) {
      this.barChartData.push({ stack: 'Stack 3', label: 'Strokes', data: this.strokes[2], backgroundColor: '#222CF0', borderWidth: 1 });
      this.barChartData.push({ stack: 'Stack 3', label: 'Puts', data: this.pats[2], backgroundColor: '#6467A9', borderWidth: 1 });
    }
    if (this.strokes.length > 3) {
      this.barChartData.push({ stack: 'Stack 4', label: 'Strokes', data: this.strokes[3], backgroundColor: '#F22F70', borderWidth: 1 });
      this.barChartData.push({ stack: 'Stack 4', label: 'Puts', data: this.pats[3], backgroundColor: '#AE6980', borderWidth: 1 });
    }

    console.log(this.barChartLabels);
    console.log(this.barChartData);

    this.barChartOptions = {
      responsive: true,
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: 10,
            stepSize: 1
          }
        }]
      },
      tooltips: {
        callbacks: {
          title: (tooltipItem: { xLabel: string; }[]) => 'Hole: ' + tooltipItem[0].xLabel
        }
      }
    };
  }
  onDelete() {

    this.httpService.deleteRound(this.round.id).subscribe(roundId => {

      console.log('deleted round id: ' + roundId);
      this.alertService.success('The round has been successfully deleted', false);

    },
      (error: HttpErrorResponse) => {
        this.alertService.error('Deleting the round failed', false);
      });
    this.router.navigate(['/']);
  }
}
