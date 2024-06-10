import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

import { SearchPlayerDialogComponent } from './search-player-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SearchPlayerDialogComponent', () => {
  let component: SearchPlayerDialogComponent;
  let fixture: ComponentFixture<SearchPlayerDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ReactiveFormsModule,
        MatDialogModule,
        MatInputModule,
        BrowserAnimationsModule,
        SearchPlayerDialogComponent],
    providers: [
        HttpService,
        { provide: MatDialogRef, useValue: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                close(_value: unknown) {
                    return null;
                }
            } },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
    ]
});
    fixture = TestBed.createComponent(SearchPlayerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should execute onPrevious', () => {
    component.page = 1;
    component.onPrevious();
    expect(component.page).toBe(0);
  });

  it('should execute onNext', () => {
    component.players = [{},{},{},{},{}];
    component.onNext();
    expect(component.page).toBe(1);
  });

  it('should key up with less than 2 letters', fakeAsync(() => {

    component.f.nick.setValue('li');
    component.onKey();
    expect(component.players.length).toBe(0);
  }));

  it('should key up with more than 2 letters', fakeAsync(() => {

    component.f.nick.setValue('lis');
    component.onKey();
    expect(component.players).toBeNull();
  }));

  it('should click close', () => {
    component.close();
    expect(component.form.invalid).toBeTruthy();
  });

  it('should add player', () => {
    component.addPlayer({});
    expect(component.form.invalid).toBeTruthy();
  });

  it('should click onNew', () => {
    component.onNew();
    expect(component.form.invalid).toBeTruthy();
  });
});
