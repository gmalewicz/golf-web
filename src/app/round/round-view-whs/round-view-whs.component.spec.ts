import { ErrorInterceptor } from '@/_helpers/error.interceptor';
import { JwtInterceptor } from '@/_helpers/jwt.interceptor';
import { teeTypes } from '@/_models/tee';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoundViewWHSComponent } from './round-view-whs.component';

describe('RoundViewWHSComponent', () => {
  let component: RoundViewWHSComponent;
  let fixture: ComponentFixture<RoundViewWHSComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundViewWHSComponent ],
      imports: [
        HttpClientModule,
      ]
      ,
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundViewWHSComponent);
    component = fixture.componentInstance;
    component.playerOffset = 0;
    component.round = {course: {name: 'Lisia Polana', par: 72, holes: [{par: 4, number: 1, si: 1},
                                                                      {par: 4, number: 2, si: 2},
                                                                      {par: 4, number: 3, si: 3},
                                                                      {par: 4, number: 4, si: 4},
                                                                      {par: 4, number: 5, si: 5},
                                                                      {par: 4, number: 6, si: 6},
                                                                      {par: 4, number: 7, si: 7},
                                                                      {par: 4, number: 8, si: 8},
                                                                      {par: 4, number: 9, si: 9},
                                                                      {par: 4, number: 10, si: 10},
                                                                      {par: 4, number: 11, si: 11},
                                                                      {par: 4, number: 12, si: 12},
                                                                      {par: 4, number: 13, si: 13},
                                                                      {par: 4, number: 14, si: 14},
                                                                      {par: 4, number: 15, si: 15},
                                                                      {par: 4, number: 16, si: 16},
                                                                      {par: 4, number: 17, si: 17},
                                                                      {par: 4, number: 18, si: 18}]}, roundDate: '10/10/2020',
                                                                matchPlay: false,
                                                                player: [{nick: 'test',
                                                                  roundDetails: {whs: 10, cr: 68, sr: 133, teeId: 0,
                                                                      teeType: teeTypes.TEE_TYPE_18}}],
                                                                scoreCard: [{hole: 1, stroke: 1, pats: 0},
                                                                {hole: 2, stroke: 1, pats: 0},
                                                                {hole: 3, stroke: 1, pats: 0},
                                                                {hole: 4, stroke: 1, pats: 0},
                                                                {hole: 5, stroke: 1, pats: 0},
                                                                {hole: 6, stroke: 1, pats: 0},
                                                                {hole: 7, stroke: 1, pats: 0},
                                                                {hole: 8, stroke: 1, pats: 0},
                                                                {hole: 9, stroke: 1, pats: 0},
                                                                {hole: 10, stroke: 1, pats: 0},
                                                                {hole: 11, stroke: 1, pats: 0},
                                                                {hole: 12, stroke: 1, pats: 0},
                                                                {hole: 13, stroke: 1, pats: 0},
                                                                {hole: 14, stroke: 1, pats: 0},
                                                                {hole: 15, stroke: 1, pats: 0},
                                                                {hole: 16, stroke: 1, pats: 0},
                                                                {hole: 17, stroke: 1, pats: 0},
                                                                {hole: 18, stroke: 1, pats: 0}]};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
