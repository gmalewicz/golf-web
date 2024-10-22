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
        RegisterPlayerDialogComponent, CommonDialogComponent,
    ],
    providers: [
        { provide: MatDialogRef, useValue: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                close(_value: unknown) {
                    return null;
                }
            } },
        { provide: MAT_DIALOG_DATA, useValue: [] }
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
    component.femaleClick();
    expect(component.f.male.value).toBeFalsy();
  });

  it('should click male', () => {
    component.f.female.setValue(true);
    component.f.male.setValue(false);
    component.maleClick();
    expect(component.f.female.value).toBeFalsy();
  });

  it('should click save but form is invalid', () => {
    component.save();
    expect(component.form.invalid).toBeTruthy();
  });

  it('should click save with valid form', () => {
    component.f.female.setValue(true);
    component.f.male.setValue(false);
    component.f.nick.setValue('test');
    component.f.whs.setValue(10.1);
    component.save();
    expect(component.form.invalid).toBeFalsy();
  });

  it('should click close', () => {
    component.close();
    expect(component.form.invalid).toBeTruthy();
  });


});
