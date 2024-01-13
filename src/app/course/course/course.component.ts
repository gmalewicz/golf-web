import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Hole, Course } from '@/_models';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { Router, RouterModule, Routes } from '@angular/router';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { tap } from 'rxjs/operators';
import { CourseNavigationService } from '../_services/course-navigation.service';
import { NgChartsModule } from 'ng2-charts';
import { CourseTeesComponent } from '../course-tees/course-tees.component';
import { AuthGuard } from '@/_helpers/auth.guard';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [NgChartsModule,
            CourseTeesComponent,
            CommonModule,
            RouterModule],
  templateUrl: './course.component.html'
})
export class CourseComponent implements OnInit {

  loading: boolean;
  loadingTees: boolean;
  display: boolean;
  displayTees: boolean;
  showTeesLbl: string;

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
              private router: Router,
              private courseNavigationService: CourseNavigationService) { }

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
      this.courseNavigationService.init();
      this.barChartType = 'bar';
      this.barChartLegend = true;
      this.barChartLabels = [];
      this.barChartData = [];
      this.barData = [];
      this.courseNavigationService.removeTee.set(false);

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


    if (this.displayTees && this.courseNavigationService.tees().length === 0) {

      this.loadingTees = true;
      this.httpService.getTees(this.course.id).pipe(
        tap(
          (tees) => {
            this.courseNavigationService.tees.set(tees);
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

  clone() {
    this.course.holes = this.holes;
    this.courseNavigationService.cloneCourse.set(this.course);
    this.router.navigate(['/addCourse']).catch(error => console.log(error));
  }

}

export const courseRoutes: Routes = [

  { path: '', component: CourseComponent, canActivate: [AuthGuard] }

];
