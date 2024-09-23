import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundViewSkinsComponent } from './round-view-skins.component';
import { ComponentRef } from '@angular/core';
import { getTestRound } from '@/_helpers/test.helper';
import { Round } from '@/_models/round';

describe('RoundViewSkinsComponent', () => {
  let component: RoundViewSkinsComponent;
  let fixture: ComponentFixture<RoundViewSkinsComponent>;
  let componentRef: ComponentRef<RoundViewSkinsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundViewSkinsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoundViewSkinsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    const rnd: Round = getTestRound();
    rnd.scoreCard.forEach(sc => sc.scoreNetto = 3);
    rnd.scoreCard[0].scoreNetto = 9;
    componentRef.setInput('round', rnd);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
