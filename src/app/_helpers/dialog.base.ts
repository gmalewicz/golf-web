import { Player } from "@/_models/player";
import { Component, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    template: ''
})
export class DialogBaseComponent {
  protected fb = inject(FormBuilder);
  protected dialogRef = inject<MatDialogRef<unknown>>(MatDialogRef);


  form: FormGroup;
  player: Player;

  constructor() {
    const data = inject(MAT_DIALOG_DATA);

    this.form = this.fb.group({
      whs: [
        '',
        [
          Validators.required,
          Validators.pattern(String.raw`(-5(\.|,)0 | -[0-4](,|\.)\d|    \d(\.|,)\d|   [1-4]\d(\.|,)\d|   5[0-4](\.|,)\d)   |\d\d  |\d`),
          Validators.min(-5),
          Validators.max(54),
        ],
      ],
    });
    this.player = data.player;
  }


 get f() {
  return this.form.controls;
}

save() {
  if (this.form.invalid) {
    return;
  }
  this.dialogRef.close(this.form.value);
}

close() {
  this.dialogRef.close();
}

maleClick() {
  this.f.female.setValue(false);
}

femaleClick() {
  this.f.male.setValue(false);
}

}
