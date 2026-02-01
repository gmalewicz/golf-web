import { getTestRound } from '@/_helpers/test.helper';
import { HttpService } from '@/_services/http.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundViewFbMpComponent } from './round-view-fb-mp.component';
import { ComponentRef } from '@angular/core';

describe('RoundViewFbMpComponent', () => {

  let component: RoundViewFbMpComponent;
  let fixture: ComponentFixture<RoundViewFbMpComponent>;
  let componentRef: ComponentRef<RoundViewFbMpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [RoundViewFbMpComponent],
    providers: [HttpService, provideHttpClient(withInterceptorsFromDi())]
})
    .compileComponents();
  });

  beforeEach(() => {

    fixture = TestBed.createComponent(RoundViewFbMpComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('round', getTestRound());

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});

