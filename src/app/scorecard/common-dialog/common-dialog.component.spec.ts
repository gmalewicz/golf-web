/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonDialogComponent } from './common-dialog.component';

describe('CommonScorecardComponent', () => {
  let component: CommonDialogComponent;
  let fixture: ComponentFixture<CommonDialogComponent>;
  const fb: FormBuilder = new FormBuilder();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonDialogComponent ],
      imports: [
        MatDialogModule,
        MatInputModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonDialogComponent);
    component = fixture.componentInstance;
    component.form = fb.group({
      whs: [
        '',
        [
          Validators.required,
          Validators.pattern('-?[1-5][0-9]?.?[0-9]?$'),
          Validators.min(-5),
          Validators.max(54),
        ],
      ],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
