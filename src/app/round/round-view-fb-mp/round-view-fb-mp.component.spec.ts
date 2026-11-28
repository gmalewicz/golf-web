import { getTestRound } from '@/_helpers/test.helper';
import { HttpService } from '@/_services/http.service';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
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
    providers: [HttpService, provideHttpClient(withXhr(), withInterceptorsFromDi())]
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

  it('should merge team result cells and show team column', () => {
    const resultCell = fixture.nativeElement.querySelector('#bck2');
    expect(resultCell.getAttribute('rowspan')).toBe('2');
    expect(resultCell.textContent).toContain('Result');
    expect(fixture.nativeElement.querySelector('#teamCol').textContent).toContain('Team');
    expect(component.playerSums).toHaveSize(4);
  });

  it('should merge team cells of players and separate teams with an empty row', () => {
    const cells: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('th.align-middle'));
    // result cell and one team cell per team spanning its two players
    expect(cells.map(c => c.getAttribute('rowspan'))).toEqual(['2', '2', '2']);
    expect(fixture.nativeElement.querySelectorAll('td[colspan="23"]')).toHaveSize(1);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});

