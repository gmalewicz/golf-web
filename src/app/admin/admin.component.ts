import { AuthenticationService } from '@/_services/authentication.service';
import { Component, ComponentFactoryResolver, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  @ViewChild('adminContainer', {read: ViewContainerRef}) adminContainerRef: ViewContainerRef;

  constructor(
    private crf: ComponentFactoryResolver,
    private injector: Injector,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {
      this.loadComponent(0);
    }
  }

  async loadComponent(comp: number) {

    if (this.adminContainerRef !== undefined) {
      this.adminContainerRef.clear();
    }

    if (comp === 0) {
      const {ResetPasswordComponent} = await import('./reset-password/reset-password.component');
      const adminPasswordFactory = this.crf.resolveComponentFactory(ResetPasswordComponent);
      const {instance} = this.adminContainerRef.createComponent(adminPasswordFactory, null, this.injector);
    } else if (comp === 1){
      const {MoveCourseComponent} = await import('./move-course/move-course.component');
      const adminPasswordFactory = this.crf.resolveComponentFactory(MoveCourseComponent);
      const {instance} = this.adminContainerRef.createComponent(adminPasswordFactory, null, this.injector);
    }
  }
}
