import { ErrorInterceptor } from '@/_helpers/error.interceptor';
import { getTestRound } from '@/_helpers/test.helper';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoundViewWHSComponent } from './round-view-whs.component';

describe('RoundViewWHSComponent', () => {

  let component: RoundViewWHSComponent;
  let fixture: ComponentFixture<RoundViewWHSComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [RoundViewWHSComponent],
    providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }, provideHttpClient(withInterceptorsFromDi()),]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundViewWHSComponent);
    component = fixture.componentInstance;
    component.playerOffset = 0;
    component.round = getTestRound();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
