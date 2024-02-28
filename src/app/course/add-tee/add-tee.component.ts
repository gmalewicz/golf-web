import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseNavigationService } from '../_services/course-navigation.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CourseHttpService } from '../_services/courseHttp.service';
import { Tee } from '@/_models/tee';
import { tap } from 'rxjs';
import { AlertService } from '@/_services';

@Component({
  selector: 'app-add-tee',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatSelectModule, ReactiveFormsModule],
  providers: [CourseHttpService],
  templateUrl: './add-tee.component.html'
})
export class AddTeeComponent implements OnInit {

  public newCourseTeeForm: FormGroup;
  teeTypes: { label: string; value: number; }[];
  sex: { label: string; value: boolean; }[];

  public saveTee = signal<boolean>(false);

  constructor(
    private formBuilder: FormBuilder,
    private courseNavigationService: CourseNavigationService,
    private courseHttpService: CourseHttpService,
    private alertService: AlertService) {
}

  ngOnInit(): void {

    this.newCourseTeeForm = this.formBuilder.group({
      tee: ['', Validators.required],
      cr: ['', [ Validators.required, Validators.pattern('[2-8][0-9](,|\\.)?[0-9]?')]],
      sr: ['', [ Validators.required, Validators.pattern('[1-2]?[0-9][0-9]$')]],
      sexDropDown: ['', [Validators.required]],
      teeTypeDropDown: ['', [Validators.required]],
    });

    // initialize tee types
    this.teeTypes = [{ label: '1-18', value: 0 },
    { label: '1-9', value: 1 },
    { label: '10-18', value: 2 }];

    this.sex = [{ label: 'female', value: true },
                      { label: 'male', value: false }];
  }

  addTee(): void {

    // mark that tee data have been submitted
    this.newCourseTeeForm.markAllAsTouched();

    // display errors if any
    if (this.newCourseTeeForm.invalid) {
      return;
    }

    //create tee
    const tee: Tee = {
      tee: this.g.tee.value,
      cr: this.g.cr.value.toString().replace(/,/gi, '.'),
      sr: this.g.sr.value,
      teeType: this.g.teeTypeDropDown.value,
      sex: this.g.sexDropDown.value
    }

    // not allow adding the tee with the same sex and tee
    if (this.courseNavigationService.tees().some(t => t.tee === tee.tee && t.sex === tee.sex && t.teeType === tee.teeType)) {
      this.alertService.error($localize`:@@adTee-WrongTeeMsg:Tee sex, type and colour must be unique`, false);
      return;
    }

    // save tee
    if (this.courseNavigationService.addTee()) {
      this.saveTee.set(true);
      this.courseHttpService.addTee(tee, this.courseNavigationService.course().id).pipe(
        tap(
          () => {
            this.courseNavigationService.tees.update(tees => [...tees, tee]);
            this.saveTee.set(false);
          })
      ).subscribe();
    } else  {
      this.courseNavigationService.tees.update(tees => [...tees, tee]);
    }

    // clear form
    this.newCourseTeeForm.reset();
  }

  // convenience getter for easy access to form fields
  get g() { return this.newCourseTeeForm.controls; }
}
