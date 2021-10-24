import { routing } from '@/app.routing';
import { HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DropdownModule } from 'primeng/dropdown';
import { MimicBackendCycleInterceptor } from '../_helpers/MimicBackendCycleInterceptor';
import { CycleHttpService } from '../_services/cycleHttp.service';

import { AddCycleComponent } from './add-cycle.component';

describe('AddCycleComponent', () => {
  let component: AddCycleComponent;
  let fixture: ComponentFixture<AddCycleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddCycleComponent],
      imports: [
        HttpClientModule,
        routing,
        ReactiveFormsModule,
        DropdownModule,
      ],
      providers: [HttpService,

        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendCycleInterceptor, multi: true },
        CycleHttpService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    localStorage.setItem('currentPlayer', JSON.stringify([{ nick: 'test' }]));
    fixture = TestBed.createComponent(AddCycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test addCycle', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.btn-success'));
    // Trigger click event after spyOn
    component.f.name.setValue('test cycle');
    component.f.ruleDropDown.setValue(0);

    buttonElement.nativeElement.click();

    tick();
    expect(component.loading).toBeFalsy();


  }));

  it('should test addCycle with invalid form', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.btn-success'));
    // Trigger click event after spyOn
    buttonElement.nativeElement.click();

    tick();
    expect(component.addCycleForm.invalid).toBeTruthy();

  }));
});
