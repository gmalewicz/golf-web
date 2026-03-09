import { NavigationService, ViewType } from "./../_services/navigation.service";
import { routing } from "@/app.routing";
import { MimicBackendAppInterceptor } from "@/_helpers/MimicBackendAppInterceptor";
import { getTestCourse } from "@/_helpers/test.helper";
import { AuthenticationService, HttpService } from "@/_services";
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MimicBackendScoreInterceptor } from "../_helpers/MimicBackendScoreInterceptor";
import {
  getOnlineRoundFirstPlayer,
  getOnlineRoundSecondPlayer,
  getOnlineScoreCard,
  rxStompServiceStub,
} from "../_helpers/test.helper";
import { ScorecardHttpService } from "../_services";
import { OnlineScoreCardViewComponent } from "./online-score-card-view.component";
import { RxStompService } from "../_services/rx-stomp.service";
import {
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from "@angular/router";
import { signal } from "@angular/core";
import { MPView } from "./formats/mp-view";
import { of } from "rxjs";
import { FBMPView } from "./formats/fbmp-view";

describe("OnlineScoreCardViewComponent", () => {
  let component: OnlineScoreCardViewComponent;
  let fixture: ComponentFixture<OnlineScoreCardViewComponent>;
  let authenticationService: AuthenticationService;
  let navigationService: NavigationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OnlineScoreCardViewComponent],
      providers: [
        HttpService,
        ScorecardHttpService,
        AuthenticationService,
        NavigationService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: MimicBackendScoreInterceptor,
          multi: true,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: MimicBackendAppInterceptor,
          multi: true,
        },
        { provide: RxStompService, useValue: rxStompServiceStub },
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules)),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    localStorage.setItem(
      "currentPlayer",
      JSON.stringify([{ nick: "test", id: 1 }]),
    );
    navigationService = TestBed.inject(NavigationService);
    spyOn(MPView.prototype, "showMatch").and.returnValue(of(void 0));
    spyOn(FBMPView.prototype, "showFBMatch").and.returnValue(of(void 0));
  });

  it("should create but player does not exists", () => {
    history.pushState({}, "");
    navigationService.setOnlineRoundsSgn(signal([getOnlineRoundFirstPlayer()]));
    authenticationService = TestBed.inject(AuthenticationService);
    authenticationService.logout();
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should create and display round for player", () => {
    navigationService.setCourseSgn(signal(getTestCourse()));
    navigationService.setOnlineRoundsSgn(signal([getOnlineRoundFirstPlayer()]));
    navigationService.setViewTypeSgn(signal(ViewType.PLAYER));
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should create and display match", () => {
    navigationService.setCourseSgn(signal(getTestCourse()));
    navigationService.setOnlineRoundsSgn(
      signal([getOnlineRoundFirstPlayer(), getOnlineRoundSecondPlayer()]),
    );
    navigationService.setViewTypeSgn(signal(ViewType.MP));
    navigationService.setOwnerSgn(signal(1));
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should create and display match", () => {
    navigationService.setCourseSgn(signal(getTestCourse()));
    navigationService.setOnlineRoundsSgn(
      signal([getOnlineRoundFirstPlayer(), getOnlineRoundSecondPlayer()]),
    );
    navigationService.setViewTypeSgn(signal(ViewType.FBMP));
    navigationService.setOwnerSgn(signal(1));
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should create and display course round", () => {
    navigationService.setCourseSgn(signal(getTestCourse()));
    navigationService.setViewTypeSgn(signal(ViewType.COURSE));
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should set mp result when player 0 wins the hole", () => {
    // Arrange
    navigationService.setCourseSgn(signal(getTestCourse()));
    navigationService.setOnlineRoundsSgn(
      signal([getOnlineRoundFirstPlayer(), getOnlineRoundSecondPlayer()]),
    );
    navigationService.setViewTypeSgn(signal(ViewType.MP));
    navigationService.setOwnerSgn(signal(1));

    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    // Prepare score cards (hole 1)
    const scPlayer0 = getOnlineScoreCard();
    scPlayer0.hole = 1;
    scPlayer0.stroke = 2;
    const scPlayer1 = getOnlineScoreCard(); // birdie
    scPlayer1.hole = 1;
    scPlayer1.stroke = 5; // bogey

    // Act – simulate WebSocket messages
    component.handleMessage(scPlayer0);
    component.handleMessage(scPlayer1);

    // Assert
    const round0 = component.onlineRoundsSgn()[0];
    const round1 = component.onlineRoundsSgn()[1];

    expect(round0.scoreCardAPI[0].mpResult).toBe(0);
  });

  it("should clear and reinitialize when previous hole is missing", () => {
    // Arrange
    navigationService.setCourseSgn(signal(getTestCourse()));
    const round = getOnlineRoundFirstPlayer();

    // Hole 1 is null → hole index 1 will fail previous hole check
    round.scoreCardAPI[0] = null;

    navigationService.setOnlineRoundsSgn(signal([round]));
    navigationService.setViewTypeSgn(signal(ViewType.PLAYER));

    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Prevent real execution
    const clearSpy = spyOn(component as any, "clear").and.callThrough();
    const initSpy = spyOn(component, "ngOnInit").and.callFake(() => {});

    // Act
    component.checkForReload(round, 1);

    // Assert
    expect(clearSpy).toHaveBeenCalled();
    expect(initSpy).toHaveBeenCalled();
  });

  afterEach(() => {
    navigationService.clear();
    localStorage.removeItem("currentPlayer");
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});

describe("prepareColoursForResults", () => {
  it("should return par when stroke equals par", () => {
    const result = OnlineScoreCardViewComponent.prepareColoursForResults(4, 4);
    expect(result).toBe("par");
  });

  it("should return boggey when stroke is one over par", () => {
    const result = OnlineScoreCardViewComponent.prepareColoursForResults(5, 4);
    expect(result).toBe("boggey");
  });

  it("should return birdie when stroke is one under par", () => {
    const result = OnlineScoreCardViewComponent.prepareColoursForResults(3, 4);
    expect(result).toBe("birdie");
  });

  it("should return eagle when stroke is two under par", () => {
    const result = OnlineScoreCardViewComponent.prepareColoursForResults(2, 4);
    expect(result).toBe("eagle");
  });

  it("should return doubleBoggey for all other cases", () => {
    expect(OnlineScoreCardViewComponent.prepareColoursForResults(6, 4)).toBe(
      "doubleBoggey",
    );

    expect(OnlineScoreCardViewComponent.prepareColoursForResults(0, 4)).toBe(
      "doubleBoggey",
    );
  });
});
