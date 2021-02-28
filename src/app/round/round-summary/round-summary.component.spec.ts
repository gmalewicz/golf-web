import { teeTypes } from '@/_models/tee';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundSummaryComponent } from './round-summary.component';

describe('RoundSummaryComponent', () => {
  let component: RoundSummaryComponent;
  let fixture: ComponentFixture<RoundSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundSummaryComponent);
    component = fixture.componentInstance;
    component.round = {course: {name: 'Lisia Polana', par: 72}, roundDate: '10/10/2020',
      matchPlay: false, player: [{nick: 'test', roundDetails: {whs: 10, cr: 68, sr: 133, teeId: 0, teeType: teeTypes.TEE_TYPE_18}}],
      scoreCard: [{hole: 1, stroke: 1, pats: 0}]};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
