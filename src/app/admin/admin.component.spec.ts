import { AuthenticationService } from "./../_services/authentication.service";
import { routing } from "@/app.routing";
import { ErrorInterceptor } from "@/_helpers/error.interceptor";
import { HttpService } from "@/_services/http.service";
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ViewContainerRef } from "@angular/core";

import { AdminComponent } from "./admin.component";
import { MatDialogModule } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import {
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from "@angular/router";
import { Subject } from "rxjs";

describe("AdminComponent", () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let authenticationService: AuthenticationService;
  let mockContainer: Partial<ViewContainerRef>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        CommonModule,
        AdminComponent,
      ],
      providers: [
        HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        AuthenticationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules)),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    localStorage.setItem(
      "currentPlayer",
      JSON.stringify([{ nick: "test", id: 1 }])
    );
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;

    // simple mock ViewContainerRef: createComponent increments length and returns a minimal ComponentRef-like object
    mockContainer = {
      clear: jasmine.createSpy("clear"),
      length: 0,
      createComponent: jasmine.createSpy("createComponent").and.callFake(() => {
        return { instance: {
          playerRoundCntEmt: new Subject<unknown[]>(),
          playerRound: undefined
        } }; // minimal fake ComponentRef
      }),
    };

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("loads MoveCourse (fakeAsync + flushMicrotasks)", async() => {
    component.adminContainerRef = mockContainer as ViewContainerRef;
    await component.loadComponent(1);
    // resolve awaited imports / Promise microtasks
    //flushMicrotasks();
    fixture.detectChanges();
    expect(mockContainer.createComponent).toHaveBeenCalled();
    expect(mockContainer.length).toBe(0);
  });

  it("loads UpdRoundHcp", async () => {
    component.adminContainerRef = mockContainer as ViewContainerRef;
    await component.loadComponent(2);
    fixture.detectChanges();
    expect(mockContainer.createComponent).toHaveBeenCalled();
    expect(mockContainer.length).toBe(0);
  });

  it("loads PlayersComponent (playerRoundCnt)", async () => {
    component.adminContainerRef = mockContainer as ViewContainerRef;
    await component.loadComponent(3);
    fixture.detectChanges();
    expect(mockContainer.createComponent).toHaveBeenCalled();
    expect(mockContainer.length).toBe(0);
  });

  it("should create but player does not exist", async  () => {
    authenticationService = TestBed.inject(AuthenticationService);
    authenticationService.logout();
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    // if you have a mock here you should set component.adminContainerRef again before detectChanges()
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    localStorage.removeItem("currentPlayer");
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
