/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RegisterPlayerDialogComponent } from './register-player-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonDialogComponent } from '../common-dialog/common-dialog.component';

describe('RegisterPlayerDialogComponent', () => {
  let component: RegisterPlayerDialogComponent;
  let fixture: ComponentFixture<RegisterPlayerDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatCheckboxModule,
        MatDialogModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      declarations: [ RegisterPlayerDialogComponent,  CommonDialogComponent],
      providers: [
        {provide: MatDialogRef, useValue: []},
        {provide: MAT_DIALOG_DATA, useValue: []}
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPlayerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should click female', () => {
    component.sexClick(true);
    expect(component.f.male.value).toBeFalsy();
  });

  it('should click male', () => {
    component.f.female.setValue(true);
    component.f.male.setValue(false);
    component.sexClick(false);
    expect(component.f.female.value).toBeFalsy();
  });

  it('should click save', () => {
    component.save();
    expect(component.form.invalid).toBeTruthy();
  });

});
