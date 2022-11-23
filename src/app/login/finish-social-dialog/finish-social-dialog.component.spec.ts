import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { FinishSocialDialogComponent } from './finish-social-dialog.component';

describe('UpdDialogComponent', () => {
  let component: FinishSocialDialogComponent;
  let fixture: ComponentFixture<FinishSocialDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FinishSocialDialogComponent ],
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
    fixture = TestBed.createComponent(FinishSocialDialogComponent);
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

  it('should press save with valid form', () => {
    spyOnProperty(component.form, 'invalid').and.returnValue(false);
    component.save();
    expect(component.form.invalid).toBeFalsy();
  });

  it('should press save with invalid form chuj', () => {
    spyOnProperty(component.form, 'invalid').and.returnValue(true);
    component.save();
    expect(component.form.invalid).toBeTruthy();
  });
});
