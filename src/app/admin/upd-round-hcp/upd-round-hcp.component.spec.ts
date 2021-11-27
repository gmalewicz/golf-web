import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { UpdRoundHcpComponent } from './upd-round-hcp.component';

describe('UpdRoundHcpComponent', () => {
  let component: UpdRoundHcpComponent;
  let fixture: ComponentFixture<UpdRoundHcpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdRoundHcpComponent ],
      imports: [
        ReactiveFormsModule,
        routing,
        HttpClientModule
      ],
      providers: [HttpService,
                  { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
                  { provide: AuthenticationService, useValue: authenticationServiceStub }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdRoundHcpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should try to update player round whs with incorrect data and failed', fakeAsync(() => {

    component.fupdRoundHcp.playerId.setValue('0');
    component.fupdRoundHcp.roundId.setValue('1');
    component.fupdRoundHcp.whs.setValue('11.1');
    const btnElement = fixture.debugElement.query(By.css('.btn-success'));
    btnElement.nativeElement.click();
    tick();
    expect(component.fupdRoundHcp.playerId.hasError).toBeTruthy();
  }));

  it('should try to update player round whs', fakeAsync(() => {

    component.fupdRoundHcp.playerId.setValue('111');
    component.fupdRoundHcp.roundId.setValue('1');
    component.fupdRoundHcp.whs.setValue('11.1');
    const btnElement = fixture.debugElement.query(By.css('.btn-success'));
    btnElement.nativeElement.click();
    tick();
    expect(component.fupdRoundHcp.playerId.value).toMatch('111');
  }));
});
