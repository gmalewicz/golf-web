import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationService } from '../_services/navigation.service';

@Component({
  selector: 'app-add-tee',
  standalone: false,
  templateUrl: './add-tee.component.html'
})
export class AddTeeComponent implements OnInit {

  public newCourseTeeForm: FormGroup;
  teeTypes: { label: string; value: number; }[];
  sex: { label: string; value: boolean; }[];

  constructor(
    private formBuilder: FormBuilder,
    private navigationService: NavigationService) {
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

    // save tee
    this.navigationService.tees.update(tees => [...tees, {
      tee: this.g.tee.value,
      cr: this.g.cr.value.toString().replace(/,/gi, '.'),
      sr: this.g.sr.value,
      teeType: this.g.teeTypeDropDown.value,
      sex: this.g.sexDropDown.value
    }])

    // clear form
    this.newCourseTeeForm.reset();
  }

  // convenience getter for easy access to form fields
  get g() { return this.newCourseTeeForm.controls; }
}
