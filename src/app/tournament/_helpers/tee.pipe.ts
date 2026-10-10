import { Pipe, PipeTransform } from '@angular/core';

const TEE_COLOURS = new Set(['red', 'yellow', 'blue', 'white', 'black']);

@Pipe({ name: 'teeColour' })
export class TeeColourPipe implements PipeTransform {
  transform(tee: string | undefined): string | null {
    if (!tee) return null;
    const match = tee.toLowerCase().split(/\s+/).find((word) => TEE_COLOURS.has(word));
    return match ?? null;
  }
}

@Pipe({ name: 'teeName' })
export class TeeNamePipe implements PipeTransform {
  transform(tee: string | undefined): string {
    return tee || '-';
  }
}
