import { Component } from '@angular/core';
import { NavigationService } from '../_services/navigation.service';
import { IconDefinition, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { Tee } from '@/_models/tee';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-tees',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule],
  templateUrl: './course-tees.component.html'
})
export class CourseTeesComponent {

  faMinusCircle: IconDefinition;

  constructor(public navigationService: NavigationService) {
    this.faMinusCircle = faMinusCircle;
  }

  deleteTee(teeToRemove: Tee) {
    this.navigationService.tees.update(tees => tees.filter(tee => (tee.tee != teeToRemove.tee && tee.sex != teeToRemove.sex)));
  }
}
