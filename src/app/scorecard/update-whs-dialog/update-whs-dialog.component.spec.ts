import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UpdateWhsDialogComponent } from './update-whs-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonDialogComponent } from '../common-dialog/common-dialog.component';

describe('UpdateWhsDialogComponent', () => {
  let component: UpdateWhsDialogComponent;
  let fixture: ComponentFixture<UpdateWhsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatCheckboxModule,
        MatDialogModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      declarations: [ UpdateWhsDialogComponent,  CommonDialogComponent ],
      providers: [
        {provide: MatDialogRef, useValue: []},
        {provide: MAT_DIALOG_DATA, useValue: []}
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateWhsDialogComponent);
    component = fixture.componentInstance;
    component.player = {nick: 'test'};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should click save', () => {
    component.save();
    expect(component.form.invalid).toBeTruthy();
  });

});
