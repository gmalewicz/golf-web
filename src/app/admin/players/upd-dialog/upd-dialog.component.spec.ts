import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { UpdDialogComponent } from './upd-dialog.component';

describe('UpdDialogComponent', () => {
  let component: UpdDialogComponent;
  let fixture: ComponentFixture<UpdDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdDialogComponent ],
      imports: [
        MatDialogModule,
        MatCheckboxModule,
        MatInputModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        {provide: MatDialogRef, useValue: {close(): void {
                 // This is intentional
        }}},
        {provide: MAT_DIALOG_DATA, useValue: []}
     ],
    })
    .compileComponents();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(UpdDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should click female sex', () => {
    component.sexClick(false);
    expect(component.form.controls.male.value).toBeFalsy();
  });

  it('should click male sex', () => {
    component.sexClick(true);
    expect(component.form.controls.female.value).toBeFalsy();
  });

  it('should press close', () => {
    component.close();
    expect(component.form.invalid).toBeTruthy();
  });

  it('should press save with valid form', () => {
    spyOnProperty(component.form, 'invalid').and.returnValue(false);
    component.save();
    expect(component.form.invalid).toBeFalsy();
  });

  it('should press save with invalid form', () => {
    component.save();
    expect(component.form.invalid).toBeTruthy();
  });
});
