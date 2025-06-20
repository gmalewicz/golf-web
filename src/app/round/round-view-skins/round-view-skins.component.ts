import { Round } from '@/_models/round';
import { NgClass } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { RangePipe } from "../../_helpers/range";

@Component({
    selector: 'app-round-view-skins',
    imports: [NgClass, RangePipe],
    templateUrl: './round-view-skins.component.html'
})
export class RoundViewSkinsComponent implements OnInit {

  round = input.required<Round>();
  first9par: number;
  last9par: number;

  skin: string[][];
  skinCount: string[][];
  first9Skin: number[];
  totalSkin: number[];

  ngOnInit(): void {

    this.first9par = this.round().course.holes.map(h => h.par).
            reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } }, 0);
    this.last9par = this.round().course.par - this.first9par;

    this.skin = Array(this.round().player.length).fill("").map(() => new Array(18).fill(""));
    this.skinCount = Array(this.round().player.length).fill("").map(() => new Array(18).fill(""));

    Array(18).forEach(id => this.calculateSkins(id));
    this.calculateTotalSkins();
  }

  
  private calculateSkins(hole: number) : void {

    let plr: number = 0;
    let minResult = 17;
    let plrIdx = 0;
    let tie: boolean = false;


    while (plr < this.round().player.length) {

      if (this.round().scoreCard[plr * 18 + hole].scoreNetto < minResult) {
        minResult = this.round().scoreCard[plr * 18 + hole].scoreNetto;
        tie = false;
        plrIdx = plr;
      } else if (this.round().scoreCard[plr * 18 + hole].scoreNetto == minResult) {
        tie = true;
      }
      this.skin[plr][hole] = "";
      plr++;
    }
    if (minResult < 17 && !tie) {
      this.skin[plrIdx][hole] = "highlight"
    }
  }

  private calculateTotalSkins() : void {

    // clear totals before recalculation
    this.totalSkin = Array(this.round().player.length).fill(0);
    this.first9Skin = Array(this.round().player.length).fill(0);

    let cumulation: number = 0;

    Array(18).forEach((idx) => {

      let increaseCumulation: boolean = false;

      for (let plr = 0; plr < this.round().player.length; plr++) {

        if (this.skin[plr][idx] === 'highlight') {
          // update first 9 skin
          if (idx < 9) {
            this.first9Skin[plr] += (cumulation + 1);
          }

          this.totalSkin[plr] += (cumulation + 1);
          this.skinCount[plr][idx] = "" + (cumulation + 1);
          cumulation = 0;
          increaseCumulation = false;
          break;
        }
        increaseCumulation = true;
      }

      if (increaseCumulation) {
        cumulation++;
      }

    })
  }
}
