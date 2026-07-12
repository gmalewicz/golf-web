import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentNavigationService } from '@/tournament/_services';

@Component({
    selector: 'app-preview',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './preview.component.html'
})
export class PreviewComponent {  navigationService = inject(TournamentNavigationService);


}
