import { ErrorInterceptor } from '@/_helpers/error.interceptor';
import { JwtInterceptor } from '@/_helpers/jwt.interceptor';
import { getTestRound } from '@/_helpers/test.helper';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundViewMPComponent } from './round-view-mp.component';

describe('RoundViewMPComponent', () => {
  let component: RoundViewMPComponent;
  let fixture: ComponentFixture<RoundViewMPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundViewMPComponent ],
      imports: [
        HttpClientModule,
      ]
      ,
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }]

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundViewMPComponent);
    component = fixture.componentInstance;
    component.round = getTestRound();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
