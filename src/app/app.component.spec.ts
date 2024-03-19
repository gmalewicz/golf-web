import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthenticationService } from './_services/authentication.service';
import { authenticationServiceStub } from './_helpers/test.helper';
import { routing } from './app.routing';

describe('LoginComponent', () => {

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
      AppComponent
    ],
    providers: [
      { provide: AuthenticationService, useValue: authenticationServiceStub },
      provideRouter(routing, withPreloading(PreloadAllModules))
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
      expect(component.title).toEqual('golf-web');
  });



  afterAll(() => {
    TestBed.resetTestingModule();
  });
});

