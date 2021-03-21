import { getTestRound } from '@/_helpers/test.helper';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule} from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundViewMPComponent } from './round-view-mp.component';

describe('RoundViewMPComponent', () => {

  let component: RoundViewMPComponent;
  let fixture: ComponentFixture<RoundViewMPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundViewMPComponent ],
      imports: [
        HttpClientModule,
      ]
      ,
      providers: [HttpService]

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundViewMPComponent);
    component = fixture.componentInstance;
    component.round = getTestRound();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});

