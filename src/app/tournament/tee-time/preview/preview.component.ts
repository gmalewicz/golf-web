import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentNavigationService } from '@/tournament/_services';

@Component({
    selector: 'app-preview',
    imports: [CommonModule],
    templateUrl: './preview.component.html'
})
export class PreviewComponent {

  constructor(public navigationService: TournamentNavigationService) {}

}
