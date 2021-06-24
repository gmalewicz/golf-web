describe('Register Test', () => {

  context('Form submission', () => {

    beforeEach(function () {
      cy.visit('/register')
    })

    it('tries to register without nick', function () {
      cy.get('input[formcontrolname=password]').type('welcome')
      cy.get('form').submit()
      cy.contains('Nick is required')

    })

    it('tries to register with too long nick', function () {
      cy.get('input[formcontrolname=password]').type('welcome')
      // nick canot be longer than 10 characters
      cy.get('input[formcontrolname=nick]').type('12345678901')
      cy.get('form').submit()
      cy.contains('Nick can be up to 10 characters long')

    })

    it('tries to register without password', function () {
      cy.get('input[formcontrolname=nick]').type('golfer')
      cy.get('form').submit()
      cy.contains('Password is required')

    })

    it('tries to register with too short password', function () {
      cy.get('input[formcontrolname=nick]').type('golfer')
      // password must be at least 6 charatcers
      cy.get('input[formcontrolname=password]').type('123')
      cy.get('form').submit()
      cy.contains('Password must be at least 6 characters')

    })

    it('tries to register without WHS', function () {
      cy.get('input[formcontrolname=nick]').type('golfer')
      cy.get('input[formcontrolname=password]').type('welcome')
      cy.get('form').submit()
      cy.contains('WHS is required')
    })

    it('tries to register with invalid WHS', function () {
      cy.get('input[formcontrolname=nick]').type('golfer')
      cy.get('input[formcontrolname=password]').type('welcome')
      cy.get('input[formcontrolname=whs]').type('a')
      cy.get('form').submit()
      cy.contains('Provide valid value')
    })

    it('tries to register with too big WHS', function () {
      cy.get('input[formcontrolname=nick]').type('golfer')
      cy.get('input[formcontrolname=password]').type('welcome')
      cy.get('input[formcontrolname=whs]').type('222')
      cy.get('form').submit()
      cy.contains('WHS is caannot be higer than 54')
    })

    it('tries to register with incorrect captcha', function () {
      cy.get('input[formcontrolname=nick]').type('golfer')
      cy.get('input[formcontrolname=password]').type('welcome')
      cy.get('input[formcontrolname=whs]').type('22')
      cy.get('form').submit()
      cy.contains('Please mark the checkbox')

    })
  })
})
