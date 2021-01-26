import { HttpService } from '../_services/http.service';
import { Component, OnInit } from '@angular/core';
import { Hole, Tee, Course } from '@/_models';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Router } from '@angular/router';
import { AlertService, AuthenticationService } from '@/_services';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html'
})
export class CourseComponent implements OnInit {

  loading: boolean;
  display: boolean;
  displayTees: boolean;
  showTeesLbl: string;
  tee: Tee[];

  course: Course;
  holes: Array<Hole>;

  barChartType: ChartType;
  barChartLegend: boolean;
  barChartLabels: string[];
  barChartData: ChartDataSets[];
  barChartOptions: ChartOptions;
  barData: number[];

  constructor(private httpService: HttpService,
              private alertService: AlertService,
              public authenticationService: AuthenticationService,
              private router: Router) { }

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      // initializaion
      this.loading = false;
      this.display = false;
      this.displayTees = false;
      this.showTeesLbl = 'Show tees';
      this.tee = [];
      this.barChartType = 'bar';
      this.barChartLegend = true;
      this.barChartLabels = [];
      this.barChartData = [];
      this.barData = [];

      this.course = history.state.data.course;
      this.getHoles();
    }
  }

  getHoles() {
    this.httpService.getHoles(this.course.id).subscribe(retHoles => {
      // console.log(retHoles);
      this.holes = retHoles;
      this.generateLabelsAndData();
      this.display = true;
    });
  }

  generateLabelsAndData() {

    // console.log(this.holes);

    for (const hole of this.holes) {
      this.barChartLabels.push(hole.number + '(' + hole.si + ')');
      this.barData.push(hole.par);
    }

    this.barChartData = [{ data: this.barData, label: 'Par(SI)', backgroundColor: 'purple', borderWidth: 1 }];

    // console.log(this.barChartLabels);
    // console.log(this.barChartData);

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
      title: {
        display: true,
        text: this.course.name + '  - Par: ' + this.course.par,
        position: 'bottom'
      },
      tooltips: {
        callbacks: {
          title: (tooltipItem: { xLabel: string; }[]) => 'Hole: ' + tooltipItem[0].xLabel
        }
      }
    };

  }

  onShowTees() {

    this.displayTees = !this.displayTees;

    if (this.displayTees && this.tee.length === 0) {

      this.httpService.getTees(this.course.id).pipe(
        tap(
          (tee) => {
            this.tee = tee;
          })
      ).subscribe();
    }

    if (this.displayTees) {
      this.showTeesLbl = 'Hide tees';
    } else {
      this.showTeesLbl = 'Show tees';
    }
  }

  delete() {

    this.loading = true;

    this.httpService.deleteCourse(this.course.id).pipe(
      tap(
        () => {
          this.alertService.success('The course has been successfully deleted', true);
          this.router.navigate(['/']);
        })
    ).subscribe();
  }

}
