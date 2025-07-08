import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'range'
})
export class RangePipe implements PipeTransform {
  transform(length: number, offset: number = 0): number[] {
    if (!length) {
      return [];
    }
    const array = [];
    for (let n = 0; n < length; ++n) {
      array.push(offset + n);
    }
    return array;
  }
}