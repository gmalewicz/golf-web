export function getDateAndTime(): string[] {

  // construct default teetime and tee date to be automatically assign for the round
  const dateTime = new Date();
  const teeTime = dateTime.toISOString().substr(11, 5);
  const teeDate = dateTime.toISOString().substr(0, 10).replace(/-/gi, '/');
  return [teeDate, teeTime];
}
