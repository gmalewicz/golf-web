import { routing } from '@/app.routing';
import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
  templateUrl: './move-course.component.html'
})
export class MoveCourseComponent implements OnInit {

  moveCourseForm: FormGroup;
  submittedMoveCourse: boolean;
  moveLoading: boolean;

  constructor(private formBuilder: FormBuilder,
              private alertService: AlertService,
              private httpService: HttpService,
              private router: Router) { }

  ngOnInit(): void {

    this.moveCourseForm = this.formBuilder.group({
      courseId: ['', [Validators.required, Validators.pattern('[1-9]\\d{0,9}')]],
    });
  }

  // convenience getter for easy access to form fields
  get fMove() { return this.moveCourseForm.controls; }

  onSubmitMoveCourse() {

    this.submittedMoveCourse = true;

    // stop here if form is invalid
    if (this.moveCourseForm.invalid) {
      return;
    }

    this.moveLoading = true;

    this.httpService.purgeCourse(this.fMove.courseId.value).pipe(
      tap(
        () => {
          this.alertService.success('Course has been moved to history', true);
          this.moveLoading = false;
          this.router.navigate(['/home']).catch(error => console.log(error));
        })
    ).subscribe();
  }
}

@NgModule({
  declarations: [MoveCourseComponent],
  imports: [CommonModule, ReactiveFormsModule, routing]
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MoveCourseModule {}
