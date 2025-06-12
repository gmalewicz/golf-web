
import { routing } from '@/app.routing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withPreloading, PreloadAllModules, Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { InfoComponent } from './info.component';
import { getOnlineRoundFirstPlayer } from '../_helpers/test.helper';
import { NavigationService } from '../_services/navigation.service';
import { on } from 'events';

describe('InfoComponent', () => {

  let component: InfoComponent;
  let fixture: ComponentFixture<InfoComponent>;
  let navigationService: NavigationService;

  let mockRouter = {
    // navigate: jasmine.createSpy('navigate'),
    getCurrentNavigation: () => {
      return {
         extras: {
            state:{
              onlineRounds: [getOnlineRoundFirstPlayer()]
            }
        }
      }
    },
    navigate(): Promise<boolean> {
      return new Promise(() => {
        return true;
      });
    }
  }

  it('should create and call onBack for MP round', async () => {
    
    await TestBed.configureTestingModule({
      imports: [
          MatButton,
          InfoComponent
      ],
      providers: [
          NavigationService,
          provideRouter(routing, withPreloading(PreloadAllModules)),
          { provide: Router, useValue: mockRouter},
      ]
    })
    .compileComponents();

    navigationService = TestBed.inject(NavigationService);
    fixture = TestBed.createComponent(InfoComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    component.onBack();
  });

  it('should create and call onBack for non MP round', async () => {

    let onlineRound = getOnlineRoundFirstPlayer();
    onlineRound.matchPlay = false;
   
    mockRouter.getCurrentNavigation = () => {
      return {
         extras: {
            state:{
              onlineRounds: [onlineRound]
            }
        }
      }
    };
    
    await TestBed.configureTestingModule({
      imports: [
          MatButton,
          InfoComponent
      ],
      providers: [
          NavigationService,
          provideRouter(routing, withPreloading(PreloadAllModules)),
          { provide: Router, useValue: mockRouter},
      ]
    })
    .compileComponents();

    navigationService = TestBed.inject(NavigationService);
    fixture = TestBed.createComponent(InfoComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    component.onBack();
  });
});

