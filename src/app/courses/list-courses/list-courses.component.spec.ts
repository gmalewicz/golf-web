
import { routing } from '@/app.routing';
import { ErrorInterceptor } from '@/_helpers/error.interceptor';
import { JwtInterceptor } from '@/_helpers/jwt.interceptor';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCoursesComponent } from './list-courses.component';

describe('ListCoursesComponent', () => {
  let component: ListCoursesComponent;
  let fixture: ComponentFixture<ListCoursesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListCoursesComponent ],
      imports: [
        HttpClientModule,
        routing,
      ],
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCoursesComponent);
    component = fixture.componentInstance;

    component.selectedTab = 0;
    component.courses = {favourites: [{name: 'Lisia Polana', par: 72, holeNbr: 18}]};

    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
