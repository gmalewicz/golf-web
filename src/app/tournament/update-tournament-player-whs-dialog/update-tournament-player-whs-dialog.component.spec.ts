import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UpdateTournamentPlayerWhsDialogComponent } from './update-tournament-player-whs-dialog.component';
import { CommonDialogComponent } from '@/dialogs/common-dialog/common-dialog.component';

describe('UpdateTournamentPlayerWhsDialogComponent', () => {
  let component: UpdateTournamentPlayerWhsDialogComponent;
  let fixture: ComponentFixture<UpdateTournamentPlayerWhsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        UpdateTournamentPlayerWhsDialogComponent,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatDialogModule,
        MatInputModule,
        BrowserAnimationsModule,
        CommonDialogComponent,
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
    fixture = TestBed.createComponent(UpdateTournamentPlayerWhsDialogComponent);
    component = fixture.componentInstance;
    component.player = {nick: 'test'};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should click save with invalid form', () => {
    component.save();
    expect(component.form.invalid).toBeTruthy();
  });

  it('should click save with valid form', () => {
    component.f.whs.setValue('10.0');
    component.save();
    expect(component.form.invalid).toBeFalsy();
  });

  it('should close the form', () => {
    component.close();
    expect(component.form.invalid).toBeTruthy();
  });

});
