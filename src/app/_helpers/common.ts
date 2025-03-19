export function getDateAndTime(): string[] {

  // construct default teetime and tee date to be automatically assign for the round
  const dateTime = new Date();
  const teeTime = dateTime.toISOString().substring(11, 16);
  const teeDate = dateTime.toISOString().substring(0, 10).replace(/-/gi, '/');
  return [teeDate, teeTime];
}

export const ballPickedUpStrokes = 16;
