import { Component } from '@angular/core';
import { CourseNavigationService } from '../_services/course-navigation.service';
import { IconDefinition, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { Tee } from '@/_models/tee';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@Component({
  selector: 'app-course-tees',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './course-tees.component.html'
})
export class CourseTeesComponent {

  faMinusCircle: IconDefinition;

  constructor(public courseNavigationService: CourseNavigationService) {
    this.faMinusCircle = faMinusCircle;
  }

  deleteTee(teeToRemove: Tee) {
    this.courseNavigationService.tees.update(tees => tees.filter(tee => (tee.tee != teeToRemove.tee && tee.sex != teeToRemove.sex)));
  }
}
