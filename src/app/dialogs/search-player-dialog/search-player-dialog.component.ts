import { Player } from '@/_models/player';
import { HttpService } from '@/_services/http.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { tap } from 'rxjs/operators';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { MatInput } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';

@Component({
    selector: 'app-search-player-dialog',
    templateUrl: './search-player-dialog.component.html',
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, ReactiveFormsModule, MatFormField, MatInput, FaIconComponent]
})
export class SearchPlayerDialogComponent {

  static readonly PAGE_SIZE = 5;

  page: number;
  form: FormGroup;
  players: Player[];
  dispPlayers: boolean;
  faPlusCircle: IconDefinition;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SearchPlayerDialogComponent>,
    private httpService: HttpService,
    // @Inject(MAT_DIALOG_DATA) data
  ) {
    this.faPlusCircle = faPlusCircle;
    this.dispPlayers = true;
    this.page = 0;
    this.players = [];
    this.form = this.fb.group({
      nick: ['', [Validators.required, Validators.maxLength(20)]],
    });
  }

  get pageSize(): number {
    return SearchPlayerDialogComponent.PAGE_SIZE;
  }


  onPrevious(): void {
    if (this.page > 0) {
      this.page--;
      this.getPlayers();
    }
  }

  onNext(): void {
    if (this.players.length === this.pageSize) {
      this.page++;
      this.getPlayers();
    }
  }

  getPlayers(): void {
    this.dispPlayers = false;
    this.httpService.searchForPlayer(this.f.nick.value, this.page).pipe(
      tap(
        retPlayers => {
          this.players = retPlayers;
          this.dispPlayers = true;
        })
    ).subscribe();
  }

  onKey() {

    // only if at least 3 letters have been provided
    if (this.form.invalid || this.f.nick.value.length < 3) {
      return;
    }
    this.getPlayers();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  addPlayer(player: Player) {
    this.dialogRef.close(player);
  }

  close() {
    this.dialogRef.close();
  }

  onNew() {
    this.dialogRef.close({action: 'new'});
  }
}
