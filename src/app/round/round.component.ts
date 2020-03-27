import { Component, OnInit} from '@angular/core';
import { ChartType, ChartDataSets, ChartOptions } from 'chart.js';
import { HttpService} from '@/_services';
import { Round } from '@/_models';


@Component({
  selector: 'app-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class RoundComponent implements OnInit {

  round: Round;

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartLabels: number[] = [];
  public barChartData: ChartDataSets[];
  public barChartOptions: ChartOptions;

  strokes: number[] = [];
  pats: number[] = [];
  par: number[] = [];

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.round = history.state.data.round;
    this.showRound();
  }

  showRound() {

      this.strokes = [];
      this.pats = [];
      this.par = [];
      this.barChartLabels = [];
      console.log('strokes: ' + this.strokes);
      console.log('pats: ' + this.pats);
      console.log('par: ' + this.par);
      this.httpService.getScoreCards(this.round.id).subscribe(retScoreCards => {
        console.log(retScoreCards);

        // to be rewritten
        for (let hole = 0; hole < 18; hole++) {
          this.strokes.push(retScoreCards[hole].stroke);
          this.pats.push(retScoreCards[hole].pats);
          this.barChartLabels.push(retScoreCards[hole].hole);
        }
      });

      this.httpService.getHoles(this.round.course.id).subscribe(retHoles => {
        console.log(retHoles);
        for (let hole = 0; hole < 18; hole++) {
          this.par.push(retHoles[hole].par);
        }
      });

      this.generateLabelsAndData();
  }

  generateLabelsAndData() {

    this.barChartData = [{ stack: 'Stack 0', label: 'Par', data: this.par, backgroundColor: 'purple', borderWidth: 1 },
    { stack: 'Stack 1', label: 'Strokes', data: this.strokes, backgroundColor: 'red', borderWidth: 1 },
    { stack: 'Stack 1', label: 'Puts', data: this.pats, backgroundColor: 'blue', borderWidth: 1 }];

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
}
