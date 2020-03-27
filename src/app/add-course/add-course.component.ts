import { Component, OnInit} from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Hole, Course } from '@/_models';
import { HttpService} from '@/_services';

@Component({
  selector: 'app-add-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.css']
})
export class AddCourseComponent implements OnInit {

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartLabels: number[] = [];
  public barChartData: ChartDataSets[];
  public barChartOptions: ChartOptions;

  public parButtons = [3, 4, 5, 6];
  public courseName = '';
  public coursePar = '';

  updatingHhole = 0;

  pars: number[] = [];

  constructor(private httpService: HttpService) {

   this.generateLabelsAndData();

  }

  ngOnInit(): void {
  }

  generateLabelsAndData() {

    console.log('on changes executed');

    this.barChartLabels = [];

    for (let hole = 1; hole <= 18; hole++) {
      this.barChartLabels.push(hole);
      this.pars.push(0);
    }

    this.barChartData = [{ data: this.pars, label: 'Par', backgroundColor: 'purple', borderWidth: 1 }];

    console.log(this.barChartLabels);
    console.log(this.barChartData);

    this.barChartOptions = {
      responsive: true,
      scales: {
        yAxes: [{
          ticks: {
            min: 2,
            max: 6,
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

  selectHole(hole) {
    console.log('selected hole: ' + hole);
    this.updatingHhole = hole;
  }

  slectPar(par) {
    console.log('selected par: ' + par);

    const updatedPars = [];

    for (let hole = 0; hole < 18; hole++) {

      updatedPars.push(this.pars[hole]);

    }
    console.log('updated pars: ' + updatedPars);

    this.pars[this.updatingHhole - 1] = par;
    updatedPars[this.updatingHhole - 1] = par;
    this.barChartData[0].data = updatedPars;
  }

  save() {

    const newHoles: Hole[] = [];

    for (let hole = 0; hole < 18;  hole++) {
      newHoles.push({par:  this.pars[hole], number:  hole + 1});

    }
    const course: Course = ({
      name: this.courseName,
      par: +this.coursePar,
      holes: newHoles
    });
    console.log('prepared course: ' + course.name + ' ' + course.par + ' ' + course.holes);

    this.httpService.addCourse(course).subscribe(newCourse => {
      console.log(newCourse);
    });
  }

  clear() {
    this.courseName = '';
    this.coursePar = '';

    this.pars = [];
    this.barChartData[0].data = this.pars;
  }
}
