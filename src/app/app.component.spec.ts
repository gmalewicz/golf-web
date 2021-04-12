import { HttpService } from './_services/http.service';
import { NavigationComponent } from './navigation/navigation.component';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { AuthenticationService } from './_services/authentication.service';
import { authenticationServiceStub } from './_helpers/test.helper';
import { Component } from '@angular/core';

describe('AppComponent', () => {

  @Component({selector: 'app-alert', template: ''})
  class ChildStubComponent {}

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [HttpService,
                  { provide: AuthenticationService, useValue: authenticationServiceStub}
                  ],
      declarations: [
        AppComponent,
        NavigationComponent,
        ChildStubComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'golf-web'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('golf-web');
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
