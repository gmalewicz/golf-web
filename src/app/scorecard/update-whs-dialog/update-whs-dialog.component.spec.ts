import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UpdateWhsDialogComponent } from './update-whs-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonDialogComponent } from '@/dialogs/common-dialog/common-dialog.component';

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
        UpdateWhsDialogComponent, CommonDialogComponent,
    ],
    providers: [
        { provide: MatDialogRef, useValue: [] },
        { provide: MAT_DIALOG_DATA, useValue: [] }
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
