import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { UpdPlayerRndComponent } from './upd-player-rnd.component';

describe('UpdRoundHcpComponent', () => {
  let component: UpdPlayerRndComponent;
  let fixture: ComponentFixture<UpdPlayerRndComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdPlayerRndComponent ],
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
    fixture = TestBed.createComponent(UpdPlayerRndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should try to swap player round whs with incorrect data and failed', fakeAsync(() => {

    component.fupdPlrRnd.oldPlrId.setValue('0');
    component.fupdPlrRnd.newPlrId.setValue('1');
    component.fupdPlrRnd.roundId.setValue('1');
    const btnElement = fixture.debugElement.query(By.css('.btn-success'));
    btnElement.nativeElement.click();
    tick();
    expect(component.fupdPlrRnd.oldPlrId.hasError).toBeTruthy();
  }));

  it('should try to swap player round', fakeAsync(() => {

    component.fupdPlrRnd.oldPlrId.setValue('1');
    component.fupdPlrRnd.newPlrId.setValue('1');
    component.fupdPlrRnd.roundId.setValue('1');
    const btnElement = fixture.debugElement.query(By.css('.btn-success'));
    btnElement.nativeElement.click();
    tick();
    expect(component.fupdPlrRnd.playerId.value).toMatch('1');
  }));
});
