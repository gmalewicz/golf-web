import { routing } from '@/app.routing';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';
import { HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ChartsModule } from 'ng2-charts';
import { DropdownModule } from 'primeng/dropdown';


import { AddCourseComponent } from './add-course.component';

describe('AddCourseComponent', () => {
  let component: AddCourseComponent;
  let fixture: ComponentFixture<AddCourseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCourseComponent ],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        ChartsModule,
        DropdownModule,
        routing,
      ],
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    localStorage.removeItem('currentPlayer');
    fixture = TestBed.createComponent(AddCourseComponent);
    component = fixture.componentInstance;
    spyOnProperty(component.authenticationService , 'currentPlayerValue').and.returnValue({nick: 'test', id: 1});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should click Clear button', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.btn-clear'));
    spyOn(component, 'clear');
    // Trigger click event after spyOn
    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.clear).toHaveBeenCalled();

  }));

  it('should test clear() function', fakeAsync(() => {

    component.f.courseName.setValue('test');
    const buttonElement = fixture.debugElement.query(By.css('.btn-clear'));
    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.f.courseName.value).toMatch('');

  }));

  it('should test selectHole() function', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.input-hole'));
    // Trigger click event after spyOn
    radioElement.triggerEventHandler('click', {});
    tick();
    expect(component.updatingHole).toBe(0);

  }));

  it('should test selectPar() function', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.input-par'));
    // Trigger click event after spyOn
    radioElement.triggerEventHandler('click',  {});
    tick();
    expect(component.pars[component.updatingHole]).toBe(3);

  }));

  it('should test selectSi() function', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.input-si'));
    // Trigger click event after spyOn
    radioElement.triggerEventHandler('click',  {});
    tick();
    expect(component.si[component.updatingHole]).toBe(1);

  }));

  it('should test addTee() function', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.btn-tee'));
    // Trigger click event after spyOn
    component.f.tee.setValue(0);
    component.f.cr.setValue(62);
    component.f.sr.setValue(123);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(component.tees.length).toBe(1);

  }));

  it('should test onSubmit() function not all pars set', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.btn-submit'));
    // Trigger click event after spyOn
    component.f.courseName.setValue('test');
    component.f.coursePar.setValue(72);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(component.pars.includes(0)).toBeTruthy();

  }));

  it('should test onSubmit() function not all si set', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.btn-submit'));
    // Trigger click event after spyOn
    component.f.courseName.setValue('test');
    component.f.coursePar.setValue(72);
    component.pars.fill(3);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(component.si.includes(0)).toBeTruthy();

  }));

  it('should test onSubmit() function no tee set', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.btn-submit'));
    // Trigger click event after spyOn
    component.f.courseName.setValue('test');
    component.f.coursePar.setValue(72);
    component.pars.fill(3);
    component.si.fill(5);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(component.tees.length).toBe(0);

  }));

});
