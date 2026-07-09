import { Pipe, PipeTransform } from '@angular/core';

const TEE_COLOURS = new Set(['red', 'yellow', 'blue', 'white', 'black']);

@Pipe({ name: 'teeColour' })
export class TeeColourPipe implements PipeTransform {
  transform(tee: string | undefined): string | null {
    if (!tee) return null;
    const name = tee.toLowerCase();
    return TEE_COLOURS.has(name) ? name : null;
  }
}

@Pipe({ name: 'teeName' })
export class TeeNamePipe implements PipeTransform {
  transform(tee: string | undefined): string {
    return tee || '-';
  }
}
