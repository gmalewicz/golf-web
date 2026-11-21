import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PzgIdDialogComponent } from './pzg-id-dialog.component';

describe('PzgIdDialogComponent', () => {
  let component: PzgIdDialogComponent;
  let fixture: ComponentFixture<PzgIdDialogComponent>;
  let closeSpy: jasmine.Spy;

  function create(pzgId: number | null) {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { nick: 'test', pzgId } });
    fixture = TestBed.createComponent(PzgIdDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(waitForAsync(() => {
    closeSpy = jasmine.createSpy('close');
    TestBed.configureTestingModule({
      imports: [MatDialogModule, BrowserAnimationsModule, PzgIdDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  it('should be prefilled with current value', () => {
    create(123);
    expect(component.form.controls.pzgId.value).toEqual('123');
  });

  it('should be empty when not set', () => {
    create(null);
    expect(component.form.controls.pzgId.value).toEqual('');
  });

  it('should save a valid number', () => {
    create(null);
    component.form.controls.pzgId.setValue('456');
    component.save();
    expect(closeSpy).toHaveBeenCalledWith({ pzgId: 456 });
  });

  it('should save null for empty value', () => {
    create(123);
    component.form.controls.pzgId.setValue('');
    component.save();
    expect(closeSpy).toHaveBeenCalledWith({ pzgId: null });
  });

  it('should not save invalid values', () => {
    create(null);
    for (const v of ['0', '-5', '1.5', 'abc']) {
      component.form.controls.pzgId.setValue(v);
      component.save();
    }
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('should close without result on cancel', () => {
    create(123);
    component.close();
    expect(closeSpy).toHaveBeenCalledWith();
  });
});
