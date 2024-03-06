import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ModificationComponent } from './modification.component';
import { TournamentNavigationService } from '@/tournament/_services/tournamentNavigation.service';
import { TeeTimePublishStatus } from '@/tournament/_models';

describe('ModificationComponent', () => {
  let component: ModificationComponent;
  let fixture: ComponentFixture<ModificationComponent>;
  const tournamentNavigationService: TournamentNavigationService = new TournamentNavigationService();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificationComponent],
      providers: [
        { provide: TournamentNavigationService, useValue: tournamentNavigationService},
      ]
    })
    .compileComponents();
    tournamentNavigationService.tournamentPlayers.set([]);
    fixture = TestBed.createComponent(ModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should modifyPlayer when first to swap is undefined', () => {
    component.modBackCls.push('');
    component.modifyPlayer(0);
    expect(component.modBackCls[0]).toBe('golf-background-red');
  });

  it('should modifyPlayer when first to swap is defined', fakeAsync(() => {
    tournamentNavigationService.teeTimeParameters.set({firstTeeTime: "09:00", teeTimeStep: 10, flightSize: 4, published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED});
    component.modBackCls.push('');
    component.modBackCls.push('');

    component.modifyPlayer(0);
    component.modifyPlayer(1);

    tick(2000);

    expect(component.modBackCls[0]).toBe('');
  }));

});
