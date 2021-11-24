describe('Login Test', () => {

  context('Unauthorized', () => {
    it('should try to access courses page without authorization', () => {
      cy.visit('/courses');
      cy .error.contains('Login');
    })
  })

  context('Form submission', () => {

    beforeEach(function () {
      cy.visit('/login')
    })

    it('redirects to main page on success', function () {
      cy.intercept('/rest/Authenticate', (req) => {

        req.reply({id: 1, nick: 'golfer', sex: false, whs: 45.0, role:0})

      })
      cy.get('input[formcontrolname=username]').type('golfer')
      cy.get('input[formcontrolname=password]').type('welcome')
      cy.get('form').submit()

      cy.url().should('include', '/')
      cy.contains('Welcome golfer')

    })

    it('tries to login without username', function () {
      cy.get('input[formcontrolname=password]').type('welcome')
      cy.get('form').submit()
      cy.contains('Username is required')

    })

    it('tries to login without password', function () {
      cy.get('input[formcontrolname=username]').type('golfer')
      cy.get('form').submit()
      cy.contains('Password is required')

    })

    it('tries to login with too short password', function () {
      cy.get('input[formcontrolname=username]').type('golfer')
      cy.get('input[formcontrolname=password]').type('12')
      cy.get('form').submit()
      cy.contains('Password must be at least 6 characters')

    })

    it('tries to login with incorrect credentials', function () {

      cy.intercept('/rest/Authenticate', (req) => {

        req.reply(401, {error: '14', message: 'Incorrect user name or password'})

      })

      cy.get('input[formcontrolname=username]').type('golfer')
      cy.get('input[formcontrolname=password]').type('incorrect')
      cy.get('form').submit()
      cy.contains('Incorrect user name or password')

    })

  })
})
