describe('Logging In', function () {
  const loginPath = '/auth'
  const loginApiURL = `${Cypress.env('API_PATH')}/auth/login`
  const dashboardPath = '/dashboard'
  const username = Cypress.env('DEFAULT_USER')
  const password = Cypress.env('DEFAULT_USER_PWD')
  const invalidEmail = 'invalid-email'
  const incorrectEmail = 'no-account@test.com'

  context('Auth form submission', function () {
    beforeEach(function () {
      // observe both the UI and the network XHR call
      cy.server()
      cy.visit(loginPath)

      cy.get('form[data-cy=authForm]').as('loginForm')
      cy.get('[data-cy=emailFormGroup]').as('emailFormGroup')
      cy.get('[data-cy=passwordFormGroup]').as('passwordFormGroup')
      cy.get('[data-cy=emailFormGroup] input').as('emailInput')
      cy.get('[data-cy=passwordFormGroup] input').as('passwordInput')
    })

    it('successfully logs in', () => {
      cy.get('@emailInput').type(username)
      cy.get('@passwordInput').type(password)
      cy.get('@loginForm').submit()

      cy.route('GET', `${Cypress.env('API_PATH')}/user`).as('getUser')
      cy.wait('@getUser')

      // we should be on
      cy.url().should('include', dashboardPath)

      // username element should be visible
      cy.get('[data-cy=usernameDisplay]').should('be.visible')
    })

    it('displays error on empty e-mail input', () => {
      // enter invalid email on purpose
      cy.get('@passwordInput').type(password)
      cy.get('@loginForm').submit()

      // we should visible errors
      cy.get('@emailFormGroup').contains(/the email field is required/i)

      // and still be on the auth URL
      cy.url().should('include', loginPath)
    })

    it('displays error on invalid e-mail input', () => {
      // enter invalid email on purpose
      cy.get('@emailInput').type(invalidEmail)
      cy.get('@passwordInput').type(password)
      cy.get('@loginForm').submit()

      // we should visible errors
      cy.get('@emailFormGroup').contains(/the email field must be a valid email/i)

      // and still be on the auth URL
      cy.url().should('include', loginPath)
    })

    it('displays error on empty password input', () => {
      // enter invalid email on purpose
      cy.get('@emailInput').type(username)
      cy.get('@loginForm').submit()

      // we should get visible errors
      cy.get('@passwordFormGroup').contains(/the password field is required/i)

      // and still be on the auth URL
      cy.url().should('include', loginPath)
    })

    it('displays error on unsuccessful login attempt', function () {
      cy.route('POST', loginApiURL).as('postLogin')

      // incorrect username on password
      cy.get('@emailInput').type(incorrectEmail)
      cy.get('@passwordInput').type(password)
      cy.get('@loginForm').submit()

      // wait for login request
      cy.wait('@postLogin')

      // we should still be on the auth URL
      cy.url().should('include', loginPath)

      // and see an error alert
      cy.get('[data-cy="loginErrorAlert"]')
        .contains(/you entered a wrong email or a wrong password/i)
        .should('be.visible')
    })
  })
})
