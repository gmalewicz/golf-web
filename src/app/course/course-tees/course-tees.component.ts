import { Component } from '@angular/core';
import { NavigationService } from '../_services/navigation.service';
import { IconDefinition, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { Tee } from '@/_models/tee';

@Component({
  selector: 'app-course-tees',
  standalone: false,
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
