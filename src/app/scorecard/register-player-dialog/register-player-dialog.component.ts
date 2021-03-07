import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-register-player-dialog",
  templateUrl: "./register-player-dialog.component.html"
})
export class RegisterPlayerDialogComponent implements OnInit {
  form: FormGroup;
  display: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RegisterPlayerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.form = this.fb.group({
      nick: [data.nick, [Validators.required, Validators.maxLength(10)]],
      whs: [
        "",
        [
          Validators.required,
          Validators.pattern("-?[1-5][0-9]?.?[0-9]?$"),
          Validators.min(-5),
          Validators.max(54),
        ],
      ],
      female: [false],
      male: [true],
    });
  }

  ngOnInit() {}

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  sexClick(sex: boolean) {
    if (sex) {
      this.f.male.setValue(false);
    } else {
      this.f.female.setValue(false);
    }
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
}
