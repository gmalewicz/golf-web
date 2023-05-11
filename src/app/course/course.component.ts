import { HttpService } from '../_services/http.service';
import { Component, OnInit } from '@angular/core';
import { Hole, Tee, Course } from '@/_models';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { Router } from '@angular/router';
import { AlertService, AuthenticationService } from '@/_services';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html'
})
export class CourseComponent implements OnInit {

  loading: boolean;
  loadingTees: boolean;
  display: boolean;
  displayTees: boolean;
  showTeesLbl: string;
  tee: Tee[];

  course: Course;
  holes: Array<Hole>;

  barChartType: ChartType;
  barChartLegend: boolean;
  barChartLabels: string[];
  barChartData: ChartDataset[];
  barChartOptions: ChartOptions;
  barData: number[];

  constructor(private httpService: HttpService,
              private alertService: AlertService,
              public authenticationService: AuthenticationService,
              private router: Router) { }

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      // initializaion
      this.loading = false;
      this.loadingTees = false;
      this.display = false;
      this.displayTees = false;
      this.showTeesLbl = $localize`:@@course-showTees:Show tees`;
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
      this.holes = retHoles;
      this.generateLabelsAndData();
      this.display = true;
    });
  }

  generateLabelsAndData() {

    for (const hole of this.holes) {
      this.barChartLabels.push(hole.number + '(' + hole.si + ')');
      this.barData.push(hole.par);
    }

    this.barChartData = [{ data: this.barData, label: 'Par(SI)', backgroundColor: 'purple', borderWidth: 1 }];

    this.barChartOptions = {
      responsive: true,

      scales: {
        y: {
            min: 2,
            max: 6,
            ticks: {
              stepSize: 1
            }
        }
      },
      plugins: {
        title: {
          display: true,
          text: this.course.name + '  - Par: ' + this.course.par,
        position: 'bottom'
        },
        tooltip: {
          callbacks: {
            title: (tooltipItem: { label: string; }[]) => $localize`:@@course-hole:Hole ` + tooltipItem[0].label
          }
        }
      },
    };

  }

  onShowTees() {

    this.displayTees = !this.displayTees;


    if (this.displayTees && this.tee.length === 0) {

      this.loadingTees = true;
      this.httpService.getTees(this.course.id).pipe(
        tap(
          (tee) => {
            this.tee = tee;
            this.loadingTees = false;
          })
      ).subscribe();
    }

    if (this.displayTees) {
      this.showTeesLbl = $localize`:@@course-hideTees:Hide tees`;
    } else {
      this.showTeesLbl = $localize`:@@course-showTees:Show tees`;
    }
  }

  delete() {

    this.loading = true;

    this.httpService.deleteCourse(this.course.id).pipe(
      tap(
        () => {
          this.alertService.success($localize`:@@course-DelMsg:The course has been successfully deleted`, true);
          this.router.navigate(['/home']).catch(error => console.log(error));
        })
    ).subscribe();
  }

}
