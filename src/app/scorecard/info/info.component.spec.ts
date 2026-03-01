import { ComponentFixture, TestBed } from "@angular/core/testing";
import { InfoComponent } from "./info.component";
import { Router } from "@angular/router";
import { NavigationService } from "../_services/navigation.service";
import { Format } from "@/_models/format";

describe("InfoComponent", () => {
  let component: InfoComponent;
  let fixture: ComponentFixture<InfoComponent>;
  let router: jasmine.SpyObj<Router>;
  let navigationService: jasmine.SpyObj<NavigationService>;

  const mockOnlineRounds = [
    {
      course: { id: 1, name: "Test Course" },
      format: Format.MATCH_PLAY,
      nick: "Test Player",
    },
  ] as any;

  beforeEach(async () => {
    router = jasmine.createSpyObj<Router>("Router", [
      "navigate",
      "currentNavigation",
    ]);

    router.navigate.and.returnValue(Promise.resolve(true));

    router.currentNavigation.and.returnValue({
      extras: {
        state: {
          onlineRounds: mockOnlineRounds,
        },
      },
    } as any);

    navigationService = jasmine.createSpyObj<NavigationService>(
      "NavigationService",
      ["setCourseSgn", "setOnlineRoundsSgn"],
    );

    await TestBed.configureTestingModule({
      imports: [InfoComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: NavigationService, useValue: navigationService },
      ],
    })
      .overrideComponent(InfoComponent, {
        set: { template: "" },
      })
      .compileComponents();

    fixture = TestBed.createComponent(InfoComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should navigate to MATCH_PLAY scorecard", () => {
    component.onlineRounds[0].format = Format.MATCH_PLAY;

    component.onBack();

    expect(router.navigate).toHaveBeenCalledWith([
      "/scorecard/onlineMatchplay",
    ]);
  });

  it("should navigate to FOUR_BALL_MATCH_PLAY scorecard", () => {
    component.onlineRounds[0].format = Format.FOUR_BALL_MATCH_PLAY;

    component.onBack();

    expect(router.navigate).toHaveBeenCalledWith([
      "/scorecard/onlineFbMatchplay",
    ]);
  });

  it("should navigate to FOUR_BALL_STROKE_PLAY scorecard", () => {
    component.onlineRounds[0].format = Format.FOUR_BALL_STROKE_PLAY;

    component.onBack();

    expect(router.navigate).toHaveBeenCalledWith([
      "/scorecard/onlineFbStrokeplay",
    ]);
  });

  it("should navigate to default STROKE_PLAY scorecard", () => {
    component.onlineRounds[0].format = Format.STROKE_PLAY;

    component.onBack();

    expect(router.navigate).toHaveBeenCalledWith([
      "/scorecard/onlineStrokeplay",
    ]);
  });
});
