import { routing } from '@/app.routing';
import { getTestRound } from '@/_helpers/test.helper';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule} from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { ChartsModule } from 'ng2-charts';

import { RoundViewComponent } from './round-view.component';

describe('RoundViewComponent', () => {
  let component: RoundViewComponent;
  let fixture: ComponentFixture<RoundViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundViewComponent ],
      imports: [
        HttpClientModule,
        routing,
        MatDialogModule,
        ChartsModule
      ]
      ,
      providers: [HttpService,
        {
          provide: MatDialogRef,
          useValue: {}
        }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundViewComponent);
    component = fixture.componentInstance;
    component.round = getTestRound();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test onFirst9() function', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.first9'));
    // Trigger click event after spyOn
    radioElement.triggerEventHandler('click',  {});
    tick();
    expect(component.display9).toBe(1);
  }));

  it('should test onLast9() function', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.last9'));
    // Trigger click event after spyOn
    radioElement.triggerEventHandler('click',  {});
    tick();
    expect(component.display9).toBe(2);
  }));

  it('should test onBoth9() function', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.both9'));
    // Trigger click event after spyOn
    radioElement.triggerEventHandler('click',  {});
    tick();
    expect(component.display9).toBe(0);
  }));

  it('should test onChecked() function', fakeAsync(() => {

    const checkboxElement = fixture.debugElement.query(By.css('#player0'));
    // Trigger click event after spyOn
    checkboxElement.triggerEventHandler('change',   {target: {checked: true}, playerIdx: 0});
    tick();
    expect(component.display9).toBe(0);
  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
