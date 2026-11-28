import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { getTestRound } from '@/_helpers/test.helper';
import { Round } from '@/_models/round';
import { RoundHoleHeadComponent, RoundParRowComponent, RoundSiRowComponent } from './round-hole-rows.component';

@Component({
  template: `
    <table>
      <thead><tr appRoundHoleHead [teamColumn]="teamColumn()"></tr></thead>
      <tbody>
        <tr appRoundParRow [round]="round" [teamColumn]="teamColumn()"></tr>
        <tr appRoundSiRow [round]="round" [teamColumn]="teamColumn()"></tr>
      </tbody>
    </table>`,
  imports: [RoundHoleHeadComponent, RoundParRowComponent, RoundSiRowComponent]
})
class HostComponent {
  round: Round = getTestRound();
  teamColumn = signal(false);
}

describe('round hole rows', () => {

  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  function cells(row: number): string[] {
    const rows = fixture.nativeElement.querySelectorAll('tr') as NodeListOf<HTMLElement>;
    return Array.from(rows[row].children).map(cell => cell.textContent!.trim());
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show hole numbers with OUT, IN and TOTAL', () => {
    const head = cells(0);
    expect(head).toHaveSize(22);
    expect(head[0]).toBe('Hole');
    expect(head.slice(1, 11)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', 'OUT']);
    expect(head.slice(11)).toEqual(['10', '11', '12', '13', '14', '15', '16', '17', '18', 'IN', 'TOTAL']);
  });

  it('should show par of the holes with the sums of the nines and the course', () => {
    const par = cells(1);
    const holes = host.round.course.holes!;
    const first9 = holes.slice(0, 9).reduce((sum, hole) => sum + hole.par, 0);
    expect(par).toHaveSize(22);
    expect(par[0]).toBe('PAR');
    expect(par[1]).toBe(String(holes[0].par));
    expect(par[10]).toBe(String(first9));
    expect(par[20]).toBe(String(host.round.course.par - first9));
    expect(par[21]).toBe(String(host.round.course.par));
  });

  it('should show stroke index of the holes', () => {
    const si = cells(2);
    const holes = host.round.course.holes!;
    expect(si).toHaveSize(22);
    expect(si[0]).toBe('SI');
    expect(si[1]).toBe(String(holes[0].si));
    expect(si[11]).toBe(String(holes[9].si));
  });

  it('should add the team column only when requested', () => {
    host.teamColumn.set(true);
    fixture.detectChanges();

    expect(cells(0)).toHaveSize(23);
    expect(cells(0)[22]).toBe('Team');
    expect(cells(1)).toHaveSize(23);
    expect(cells(2)).toHaveSize(23);
  });
});
