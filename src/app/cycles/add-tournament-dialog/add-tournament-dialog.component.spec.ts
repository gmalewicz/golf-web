import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AddTournamentDialogComponent } from './add-tournament-dialog.component';

describe('AddTournamentDialogComponent', () => {
  let component: AddTournamentDialogComponent;
  let fixture: ComponentFixture<AddTournamentDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        ReactiveFormsModule,
        MatCheckboxModule,
        MatDialogModule,
        MatInputModule,
        BrowserAnimationsModule,
        AddTournamentDialogComponent,
    ],
    providers: [
        { provide: MatDialogRef, useValue: { close(): void {
                    // This is intentional
                } } },
        { provide: MAT_DIALOG_DATA, useValue: [] }
    ],
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTournamentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should press close', () => {
    component.close();
    expect(component.form.invalid).toBeTruthy();
  });

  it('should press save with invalid form', () => {
    component.save();
    expect(component.form.invalid).toBeTruthy();
  });


  it('should press save with valid form', () => {
    spyOnProperty(component.form, 'invalid').and.returnValue(false);
    component.save();
    expect(component.form.invalid).toBeFalsy();
  });

});
