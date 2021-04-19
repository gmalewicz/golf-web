describe('Main page', () => {

  it('should display the main page', () => {
    cy.visit('http://localhost:4200/');
    cy.contains('DrunkGolfers & NiceGirls');
  })


})
