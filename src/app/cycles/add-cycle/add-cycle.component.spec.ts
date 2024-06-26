import { routing } from '@/app.routing';
import { HttpService } from '@/_services';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MimicBackendCycleInterceptor } from '../_helpers/MimicBackendCycleInterceptor';
import { CycleHttpService } from '../_services/cycleHttp.service';

import { AddCycleComponent } from './add-cycle.component';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

describe('AddCycleComponent', () => {
  let component: AddCycleComponent;
  let fixture: ComponentFixture<AddCycleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        ReactiveFormsModule,
        AddCycleComponent
    ],
    providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendCycleInterceptor, multi: true },
        CycleHttpService,
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules))
    ]
})
      .compileComponents();
  }));

  it('should create without player ', () => {

    localStorage.removeItem('currentPlayer');

    fixture = TestBed.createComponent(AddCycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should test addCycle', () => {

    localStorage.setItem('currentPlayer', JSON.stringify([{ nick: 'test' }]));
    fixture = TestBed.createComponent(AddCycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('.btn-success'));
    // Trigger click event after spyOn
    component.f.name.setValue('test cycle');
    component.f.bestRounds.setValue(0);

    buttonElement.nativeElement.click();


    expect(component.loading).toBeFalsy();

  });

  it('should test addCycle with invalid form', () => {

    localStorage.setItem('currentPlayer', JSON.stringify([{ nick: 'test' }]));
    fixture = TestBed.createComponent(AddCycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('.btn-success'));
    // Trigger click event after spyOn
    buttonElement.nativeElement.click();

    //tick();
    expect(component.addCycleForm.invalid).toBeTruthy();

  });

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
    TestBed.resetTestingModule();
  });
});
