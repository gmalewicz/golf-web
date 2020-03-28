import { HttpService } from '../_services/http.service';
import { Component, OnInit} from '@angular/core';
import { Hole } from '@/_models';
import { ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '@/_services';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {

  display = false;

  holes: Array<Hole>;

  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartLabels: number[] = [];
  barChartData: ChartDataSets[] = [];
  barChartOptions: ChartOptions;
  barData: number[] = [];


  generateLabelsAndData() {

    console.log(this.holes);

    for (const hole of this.holes) {
      this.barChartLabels.push(hole.number);
      this.barData.push(hole.par);
    }

    this.barChartData = [{ data: this.barData, label: 'Par', backgroundColor: 'purple', borderWidth: 1 }];

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
        text: this.route.snapshot.params.courseName,
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
              private route: ActivatedRoute,
              private alertService: AlertService,
              private router: Router) {}

  ngOnInit(): void {
    this.getHoles();
  }

  getHoles() {
    this.httpService.getHoles(this.route.snapshot.params.id).subscribe(retHoles => {
      console.log(retHoles);
      this.holes = retHoles;
      this.generateLabelsAndData();
      this.display = true;
    });


  }

  delete() {

    this.httpService.deleteCourse(this.route.snapshot.params.id).subscribe(  courseId => {
      console.log('deleted course id: ' + courseId);
      this.alertService.success('The course has been successfully deleted', true);

    },
      (error: HttpErrorResponse) => {
        this.alertService.error('Deleting the course failed', true);
    });
    this.router.navigate(['/']);
  }

}
