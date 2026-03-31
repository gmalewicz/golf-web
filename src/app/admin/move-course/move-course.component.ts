import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { NgClass } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
    templateUrl: './move-course.component.html',
    imports: [ReactiveFormsModule, NgClass, RouterLink]
})
export class MoveCourseComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly alertService = inject(AlertService);
  private readonly httpService = inject(HttpService);
  private readonly router = inject(Router);


  moveCourseForm: FormGroup;
  submittedMoveCourse: boolean;
  moveLoading: boolean;

  ngOnInit(): void {

    this.moveCourseForm = this.formBuilder.group({
      courseId: ['', [Validators.required, Validators.pattern(String.raw`[1-9]\d{0,9}`)]],
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


