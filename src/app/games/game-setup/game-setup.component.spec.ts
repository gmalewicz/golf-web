import { routing } from '@/app.routing';
import { ErrorInterceptor } from '@/_helpers/error.interceptor';
import { JwtInterceptor } from '@/_helpers/jwt.interceptor';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { GameSetupComponent } from './game-setup.component';

describe('GameSetupComponent', () => {
  let component: GameSetupComponent;
  let fixture: ComponentFixture<GameSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameSetupComponent ],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        routing,
      ],
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
