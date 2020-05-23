import { HttpService } from '../_services/http.service';
import { Component, OnInit } from '@angular/core';
import { Hole, Tee, Course } from '@/_models';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '@/_services';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {

  loading = false;

  display = false;

  displayTees = false;
  showTeesLbl = 'Show tees';
  tee: Tee[] = [];

  course: Course;
  holes: Array<Hole>;

  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartLabels: string[] = [];
  barChartData: ChartDataSets[] = [];
  barChartOptions: ChartOptions;
  barData: number[] = [];


  generateLabelsAndData() {

    console.log(this.holes);

    for (const hole of this.holes) {
      this.barChartLabels.push(hole.number + '(' + hole.si + ')');
      this.barData.push(hole.par);
    }

    this.barChartData = [{ data: this.barData, label: 'Par(SI)', backgroundColor: 'purple', borderWidth: 1 }];

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

  constructor(private httpService: HttpService,
              private alertService: AlertService,
              private router: Router) { }

  ngOnInit(): void {
    this.course = history.state.data.course;
    this.getHoles();
  }

  getHoles() {
    this.httpService.getHoles(this.course.id).subscribe(retHoles => {
      console.log(retHoles);
      this.holes = retHoles;
      this.generateLabelsAndData();
      this.display = true;
    });
  }

  onShowTees() {

    this.displayTees = !this.displayTees;

    if (this.displayTees && this.tee.length === 0) {

      this.httpService.getTees(this.course.id).subscribe(tee => {
        console.log(tee);
        this.tee = tee;
      },
        error => {
          this.alertService.error('Cannot get course tees', false);
          this.loading = false;
          this.router.navigate(['/']);
        });
    }

    if (this.displayTees) {
      this.showTeesLbl = 'Hide tees';
    } else {
      this.showTeesLbl = 'Show tees';
    }
  }

  delete() {

    this.loading = true;

    this.httpService.deleteCourse(this.course.id).subscribe(courseId => {
      console.log('deleted course id: ' + courseId);
      this.alertService.success('The course has been successfully deleted', true);

    },
      (error: HttpErrorResponse) => {
        this.alertService.error('Deleting the course failed', true);
        this.loading = false;
      });
    this.router.navigate(['/']);
  }

}
