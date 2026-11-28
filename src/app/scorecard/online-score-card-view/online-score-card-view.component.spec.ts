import { NavigationService, ViewType } from "./../_services/navigation.service";
import { routing } from "@/app.routing";
import { MimicBackendAppInterceptor } from "@/_helpers/MimicBackendAppInterceptor";
import { getTestCourse } from "@/_helpers/test.helper";
import { AuthenticationService, HttpService } from "@/_services";
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr
} from "@angular/common/http";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MimicBackendScoreInterceptor } from "../_helpers/MimicBackendScoreInterceptor";
import {
  getOnlineRoundFirstPlayer,
  getOnlineRoundSecondPlayer,
  getOnlineRoundThirdPlayer,
  getOnlineRoundFourthPlayer,
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
  Router,
} from "@angular/router";
import { signal } from "@angular/core";
import { MPView } from "./formats/mp-view";
import { of } from "rxjs";
import { FBMPView } from "./formats/fbmp-view";
import { FBSPView } from "./formats/fbsp-view";
import { Format } from "@/_models/format";

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
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
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
    expect(component).toBeTruthy();
    fixture.destroy();
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

  it("should create and display four ball stroke play round before handicaps are loaded", () => {
    spyOn(FBSPView.prototype, "showFBSP").and.returnValue(of(void 0));
    const rounds = [
      getOnlineRoundFirstPlayer(),
      getOnlineRoundSecondPlayer(),
      getOnlineRoundThirdPlayer(),
      getOnlineRoundFourthPlayer(),
    ];
    rounds.forEach((round, idx) => (round.team = Math.floor(idx / 2) + 1));
    navigationService.setCourseSgn(signal(getTestCourse()));
    navigationService.setOnlineRoundsSgn(signal(rounds));
    navigationService.setViewTypeSgn(signal(ViewType.FBSP));
    navigationService.setOwnerSgn(signal(1));
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    expect(() => fixture.detectChanges()).not.toThrow();
    const names = Array.from(fixture.nativeElement.querySelectorAll("#fbspTeam")).map(el => (el as HTMLElement).textContent?.trim());
    expect(names).toEqual(["golfer/test", "test 2/test 3"]);
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
    const clearSpy = spyOn(component as unknown as Record<string, (...args: unknown[]) => unknown>, "clear").and.callThrough();
    const initSpy = spyOn(component, "ngOnInit").and.callFake(() => {});

    // Act
    component.checkForReload(round, 1);

    // Assert
    expect(clearSpy).toHaveBeenCalled();
    expect(initSpy).toHaveBeenCalled();
  });

  it("should redirect to login when there is no logged in player", () => {
    navigationService.setCourseSgn(signal(getTestCourse()));
    navigationService.setOnlineRoundsSgn(signal([getOnlineRoundFirstPlayer()]));
    navigationService.setViewTypeSgn(signal(ViewType.PLAYER));
    TestBed.inject(AuthenticationService).logout();
    const navigate = spyOn(TestBed.inject(Router), "navigate").and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    // the template is not rendered, because there is nothing to display without the player
    component.ngOnInit();

    expect(navigate).toHaveBeenCalledWith(["/login"]);
    expect(component.displaySgn()).toBeFalse();
  });

  it("should redirect to login when there is neither a course nor rounds to display", () => {
    const navigate = spyOn(TestBed.inject(Router), "navigate").and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(navigate).toHaveBeenCalledWith(["/login"]);
  });

  it("should return zero pars until the course and rounds are loaded", () => {
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;

    expect(component.first9parSgn()).toBe(0);
    expect(component.last9parSgn()).toBe(0);
  });

  it("should return zero first nine par after a match play result when the course has no holes", () => {
    navigationService.setCourseSgn(signal(getTestCourse()));
    navigationService.setOnlineRoundsSgn(signal([getOnlineRoundFirstPlayer(), getOnlineRoundSecondPlayer()]));
    navigationService.setViewTypeSgn(signal(ViewType.MP));
    navigationService.setOwnerSgn(signal(1));
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.courseSgn.set({ ...getTestCourse(), holes: undefined });

    component.handleMessage({ ...getOnlineScoreCard(), hole: 1, stroke: 4 });
    component.handleMessage({ ...getOnlineScoreCard(), player: { id: 2, nick: "test" }, hole: 1, stroke: 4 });

    expect(component.first9parSgn()).toBe(0);
  });

  it("should log a failure of the redirect to login", () => {
    const log = spyOn(console, "log");
    const error = new Error("navigation failed");
    // the rejection is delivered synchronously, so no change detection runs without the player
    spyOn(TestBed.inject(Router), "navigate").and.returnValue(
      { catch: (handler: (reason: unknown) => void) => handler(error) } as unknown as Promise<boolean>);

    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(log).toHaveBeenCalledWith(error);
  });

  it("should log a failure to deactivate the web socket connection", async () => {
    const log = spyOn(console, "log");
    spyOn(rxStompServiceStub, "deactivate").and.returnValue(Promise.reject(new Error("deactivate failed")));
    navigationService.setCourseSgn(signal(getTestCourse()));
    navigationService.setOnlineRoundsSgn(signal([getOnlineRoundFirstPlayer()]));
    navigationService.setViewTypeSgn(signal(ViewType.PLAYER));
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    (component as unknown as Record<string, () => void>)["clear"]();
    await fixture.whenStable();

    expect(log).toHaveBeenCalledWith(new Error("deactivate failed"));
  });

  it("should map handicap strokes to the css classes", () => {
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;

    component.holeHcpSgn.set([[0, 1, 2, 3, 4]]);

    const classes = ["", "highlightHcp", "highlightHcp2", "highlightHcp3", "highlightHcp3"];
    expect(component.fbspHcpClassSgn()).toEqual([classes]);
    expect(component.texasHcpClassSgn()).toEqual([classes]);
  });

  describe("last nine holes of a stroke play round", () => {

    beforeEach(() => {
      navigationService.setCourseSgn(signal(getTestCourse()));
      navigationService.setOnlineRoundsSgn(signal([getOnlineRoundFirstPlayer()]));
      navigationService.setViewTypeSgn(signal(ViewType.PLAYER));
      fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const round = component.onlineRoundsSgn()[0];
      round.scoreCardAPI = new Array(18).fill(null);
      round.scoreCardAPI[8] = { ...getOnlineScoreCard(), hole: 9, stroke: 4 };
      round.first9score = 4;
      round.last9score = 0;
      component.scoreBruttoClassSgn.set([new Array(18).fill("")]);
      component.first9ballPickedUpSgn.set([false]);
      component.last9ballPickedUpSgn.set([false]);
    });

    it("should add the score of a new hole to the last nine total", () => {
      component.handleMessage({ ...getOnlineScoreCard(), hole: 10, stroke: 5 });

      const round = component.onlineRoundsSgn()[0];
      expect(round.last9score).toBe(5);
      expect(round.first9score).toBe(4);
    });

    it("should replace the score when an existing hole of the last nine is updated", () => {
      component.handleMessage({ ...getOnlineScoreCard(), hole: 10, stroke: 5 });
      component.handleMessage({ ...getOnlineScoreCard(), hole: 10, stroke: 6, update: true });

      expect(component.onlineRoundsSgn()[0].last9score).toBe(6);
    });

    it("should flag the last nine when the ball is picked up", () => {
      component.handleMessage({ ...getOnlineScoreCard(), hole: 10, stroke: 16 });

      expect(component.last9ballPickedUpSgn()[0]).toBeTrue();
      expect(component.first9ballPickedUpSgn()[0]).toBeFalse();
    });
  });

  describe("document visibility", () => {

    it("should unsubscribe from the previous visibility listener when listening again", () => {
      navigationService.setCourseSgn(signal(getTestCourse()));
      navigationService.setOnlineRoundsSgn(signal([getOnlineRoundFirstPlayer()]));
      navigationService.setViewTypeSgn(signal(ViewType.PLAYER));
      fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const previous = component.subscriptions[0];
      spyOn(previous, "unsubscribe").and.callThrough();

      (component as unknown as Record<string, () => void>)["handleDocumentVisibilityChanges"]();

      expect(previous.unsubscribe).toHaveBeenCalled();
    });

    it("should reload the view when the page becomes visible", () => {
      navigationService.setCourseSgn(signal(getTestCourse()));
      navigationService.setOnlineRoundsSgn(signal([getOnlineRoundFirstPlayer()]));
      navigationService.setViewTypeSgn(signal(ViewType.PLAYER));
      fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const clear = spyOn(component as unknown as Record<string, (...args: unknown[]) => unknown>, "clear");
      const init = spyOn(component, "ngOnInit").and.callFake(() => undefined);
      spyOnProperty(document, "visibilityState", "get").and.returnValue("visible");

      document.dispatchEvent(new Event("visibilitychange"));

      expect(clear).toHaveBeenCalled();
      expect(init).toHaveBeenCalled();
    });

    it("should not reload the view when the page is hidden", () => {
      navigationService.setCourseSgn(signal(getTestCourse()));
      navigationService.setOnlineRoundsSgn(signal([getOnlineRoundFirstPlayer()]));
      navigationService.setViewTypeSgn(signal(ViewType.PLAYER));
      fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const init = spyOn(component, "ngOnInit").and.callFake(() => undefined);
      spyOnProperty(document, "visibilityState", "get").and.returnValue("hidden");

      document.dispatchEvent(new Event("visibilitychange"));

      expect(init).not.toHaveBeenCalled();
    });
  });

  describe("four ball stroke play result", () => {

    it("should show the net result of the teams below the table", () => {
      spyOn(FBSPView.prototype, "showFBSP").and.returnValue(of(void 0));
      const rounds = [
        getOnlineRoundFirstPlayer(),
        getOnlineRoundSecondPlayer(),
        getOnlineRoundThirdPlayer(),
        getOnlineRoundFourthPlayer(),
      ];
      rounds.forEach((round, idx) => {
        round.team = Math.floor(idx / 2) + 1;
        round.scoreCardAPI = [{ ...getOnlineScoreCard(), hole: 1, stroke: 4 + idx }];
      });
      navigationService.setCourseSgn(signal(getTestCourse()));
      navigationService.setOnlineRoundsSgn(signal(rounds));
      navigationService.setViewTypeSgn(signal(ViewType.FBSP));
      navigationService.setOwnerSgn(signal(1));
      fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      component.holeHcpSgn.set(rounds.map(() => new Array(18).fill(0)));
      fixture.detectChanges();

      // the scores are not loaded by the spied view, the first hole is read from scoreCardAPI by index
      expect(component.fbspScoresSgn().map(score => score.name)).toEqual(["golfer/test", "test 2/test 3"]);
      expect(fixture.nativeElement.querySelector("h3").textContent.replace(/\s+/g, " ")).toContain("golfer/test");
    });

    it("should update the round when a score is received", () => {
      spyOn(FBSPView.prototype, "showFBSP").and.returnValue(of(void 0));
      const rounds = [getOnlineRoundFirstPlayer(), getOnlineRoundSecondPlayer()];
      rounds.forEach(round => (round.team = 1));
      navigationService.setCourseSgn(signal(getTestCourse()));
      navigationService.setOnlineRoundsSgn(signal(rounds));
      navigationService.setViewTypeSgn(signal(ViewType.FBSP));
      fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.handleMessage({ ...getOnlineScoreCard(), hole: 2, stroke: 6, time: "12:30" });

      expect(component.onlineRoundsSgn()[0].scoreCardAPI![1].stroke).toBe(6);
      expect(component.lstUpdTimeSgn()).toBe("12:30");
    });
  });

  describe("texas scramble view", () => {

    function createTexasRounds() {
      const rounds = [
        getOnlineRoundFirstPlayer(),
        getOnlineRoundSecondPlayer(),
        getOnlineRoundThirdPlayer(),
        getOnlineRoundFourthPlayer(),
      ];
      rounds.forEach((round, idx) => {
        round.team = Math.floor(idx / 2) + 1;
        round.format = Format.TEXAS_SCRAMBLE;
        round.finalized = false;
        // team strokes are stored for every team player
        const teamStrokes = round.team === 1 ? [4, 5, 5] : [5, 4, 6];
        round.scoreCardAPI = teamStrokes.map((stroke, i) => ({ ...getOnlineScoreCard(), hole: i + 1, stroke, time: "10:0" + i }));
      });
      return rounds;
    }

    function createTexasView(rounds = createTexasRounds()) {
      spyOn(TestBed.inject(ScorecardHttpService), "getOnlineRound").and.returnValue(of(rounds));
      spyOn(TestBed.inject(HttpService), "getHoles").and.returnValue(of(getTestCourse().holes!));
      navigationService.setCourseSgn(signal(getTestCourse()));
      navigationService.setOnlineRoundsSgn(signal([rounds[0]]));
      navigationService.setViewTypeSgn(signal(ViewType.TEXAS));
      navigationService.setOwnerSgn(signal(1));
      fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }

    it("should load the round and build the teams", () => {
      createTexasView();

      expect(component.displaySgn()).toBeTrue();
      expect(component.finalizedSgn()).toBeFalse();
      expect(component.teeTime).toBe("20:29");
      expect(component.texasTeamsSgn().map(team => team.players)).toEqual([[0, 1], [2, 3]]);
      expect(component.holeHcpSgn()).toHaveSize(2);
      expect(component.texasHcpClassSgn()).toHaveSize(2);
    });

    it("should calculate net result and gross sums of the teams", () => {
      createTexasView();
      component.holeHcpSgn.set([new Array(18).fill(0), new Array(18).fill(0)]);

      const result = component.texasResultSgn();
      expect(result.teams.map(team => team.holes.slice(0, 3))).toEqual([[4, 5, 5], [5, 4, 6]]);
      expect(component.texasGrossSumsSgn().map(sum => sum.front)).toEqual([14, 15]);
    });

    it("should show gross rows, then net rows and the result below the table", () => {
      createTexasView();
      component.holeHcpSgn.set([new Array(18).fill(0), new Array(18).fill(0)]);
      fixture.detectChanges();

      const gross: string[] = Array.from(fixture.nativeElement.querySelectorAll("#texasGross"))
        .map(el => (el as HTMLElement).textContent!.replace(/\s+/g, " ").trim());
      const net: string[] = Array.from(fixture.nativeElement.querySelectorAll("#texasNet"))
        .map(el => (el as HTMLElement).textContent!.replace(/\s+/g, " ").trim());
      expect(gross).toEqual(["golfer/test", "test 2/test 3"]);
      expect(net).toEqual(["golfer/test (net)", "test 2/test 3 (net)"]);

      expect(component.texasScoresSgn()).toEqual([{ name: "golfer/test", total: 14 }, { name: "test 2/test 3", total: 15 }]);
      const result: string = fixture.nativeElement.querySelector("h3").textContent.replace(/\s+/g, " ").trim();
      expect(result).toBe("golfer/test 14 : test 2/test 3 15");
    });

    it("should show picked up ball as x on gross row", () => {
      const rounds = createTexasRounds();
      rounds[0].scoreCardAPI![1] = { ...getOnlineScoreCard(), hole: 2, stroke: 16, time: "10:01" };
      createTexasView(rounds);
      component.holeHcpSgn.set([new Array(18).fill(0), new Array(18).fill(0)]);
      fixture.detectChanges();

      const cells: string[] = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll("#texasGross"))
        .map(el => el.parentElement!.textContent!.replace(/\s+/g, " "));
      expect(cells[0]).toContain("x");
    });

    it("should update the team scores when a score is received", () => {
      createTexasView();
      component.holeHcpSgn.set([new Array(18).fill(0), new Array(18).fill(0)]);

      component.handleMessage({ ...getOnlineScoreCard(), hole: 4, stroke: 3, time: "12:30" });

      expect(component.onlineRoundsSgn()[0].scoreCardAPI![3].stroke).toBe(3);
      expect(component.lstUpdTimeSgn()).toBe("12:30");
      expect(component.texasScoresSgn()[0].total).toBe(17);
    });

    it("should show the result in bold when the round is finalized", () => {
      const rounds = createTexasRounds();
      rounds.forEach(round => (round.finalized = true));
      createTexasView(rounds);
      fixture.detectChanges();

      expect(component.finalizedSgn()).toBeTrue();
      expect(fixture.nativeElement.querySelector("h3").style.fontWeight).toBe("bold");
    });
  });

  afterEach(() => {
    // stop the timers of the component before the navigation data is cleared
    fixture?.destroy();
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
