import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function getDateAndTime(): string[] {

  // construct default teetime and tee date to be automatically assign for the round
  const dateTime = new Date();
  const teeTime = dateTime.toISOString().substring(11, 16);
  const teeDate = dateTime.toISOString().substring(0, 10).replace(/-/gi, '/');
  return [teeDate, teeTime];
}

export const ballPickedUpStrokes = 16;

export function generatePDF(name: string, _this): void {
  const DATA: HTMLElement = document.getElementById('pdfData');
  html2canvas(DATA).then((canvas) => {
    const fileWidth = 208;
    const fileHeight = (canvas.height * fileWidth) / canvas.width;
    const FILEURI = canvas.toDataURL('image/png');
    const PDF = new jsPDF('p', 'mm', 'a4');
    const position = 0;
    PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
    PDF.save(name + ' pdf');
    _this.loadingPDF = false;
  });
}
