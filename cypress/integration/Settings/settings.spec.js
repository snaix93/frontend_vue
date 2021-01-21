describe('Settings', function () {
  const teamSettingsApiPath = `${Cypress.env('API_PATH')}/team-setting`
  const checkoutUrl = 'https://checkout.cloudradar.info/login/'

  context('Settings Page', function () {
    beforeEach(() => {
      // Cache user/payment fixtures for stubbed response
      cy.fixture('user').as('user')
      cy.fixture('payment').as('payment')

      cy.server()

      cy.login()

      cy.visit('/settings')

      // Routes with stubbed responses
      cy.route('GET', `${Cypress.env('API_PATH')}/user/`, '@user').as('getUserStub')
      cy.route('GET', `${Cypress.env('API_PATH')}/payment/`, '@payment').as('getPaymentStub')
      cy.route('GET', `${teamSettingsApiPath}/customerManagement`, 'true').as('getCustomerManagementSettingStub')

      // Routes
      cy.route('PATCH', `${Cypress.env('API_PATH')}/user/`).as('patchUser')

      cy.wait('@getPaymentStub')
      cy.wait('@getUserStub')
      cy.wait('@getCustomerManagementSettingStub')

      cy.get('[data-cy=emailSetting]')
        .as('emailSetting')
      cy.get('[data-cy=nicknameSetting]')
        .as('nicknameSetting')
      cy.get('[data-cy=timezoneSetting]')
        .as('timezoneSetting')
      cy.get('[data-cy=languageSetting]')
        .as('languageSetting')
      cy.get('[data-cy=dateFormatSetting]')
        .as('dateFormatSetting')
      cy.get('[data-cy=checkLocationSetting]')
        .as('checkLocationSetting')
      cy.get('[data-cy=teamNameSetting]')
        .as('teamNameSetting')
      cy.get('[data-cy=customerManagementSetting]')
        .as('customerManagementSetting')
      cy.get('[data-cy=planSetting]')
        .as('planSetting')
      cy.get('[data-cy=deleteAccountSetting]')
        .as('deleteAccountSetting')

      cy.get('@deleteAccountSetting')
        .find('button')
        .contains(/delete account/i)
        .as('deleteAccountButton')

      cy.get('[data-cy=deleteConfirmationField]')
        .as('deleteConfirmationField')
    })

    it('displays user settings correctly', function () {
      // Get stubbed data and verify appropriate values are displayed
      cy.get('@user').then((_user) => {
        const user = _user.user

        cy.get('@emailSetting')
          .contains(user.email)
        cy.get('@nicknameSetting')
          .contains(/no nickname set/i)
        cy.get('@timezoneSetting')
          .contains(user.team.timezone)
        cy.get('@languageSetting')
          .contains('English')
        cy.get('@dateFormatSetting')
          .contains('DD.MM.Y HH:mm:ss')
        cy.get('@checkLocationSetting')
          .contains(user.team.frontmanLocation)
        cy.get('@checkLocationSetting')
          .contains('enabled')
        cy.get('@teamNameSetting')
          .contains(user.team.name)
        cy.get('@customerManagementSetting')
          .find('button')
          .contains('disable')
        cy.get('@planSetting')
          .contains(user.team.plan)
      })
    })

    it('successfully changes nickname', function () {
      const nickname = 'new nickname'

      cy.get('@nicknameSetting')
        .find('button')
        .click()

      cy.get('[data-cy=modalForm]:visible').as('nicknameForm')

      cy.get('@nicknameForm')
        .within(($form) => {
          cy.get('[data-cy=setNicknameFormGroup]')
            .find('input')
            .clear()
            .type(nickname)
        })
      cy.get('@nicknameForm')
        .submit()

      cy.wait('@patchUser')

      cy.get('@nicknameSetting')
        .should('contain', nickname)
    })

    it('displays payment info and provides billing management links', function () {
      cy.get('[data-cy=billingSetting]')
        .as('billingSetting')

      cy.get('@payment').then((_payment) => {
        const payment = _payment

        cy.get('@billingSetting')
          .should('contain', payment.card_brand)
          .and('contain', payment.card_last4)
          .and('contain', payment.card_exp_month)
          .and('contain', payment.card_exp_year)
      })

      cy.log('Button for billing management exists')

      cy.get('@billingSetting')
        .find('button')
        .contains(/manage billing/i)
        .as('manageBillingButton')

      cy.log('Dialog for updating card details is opening on click')

      cy.get('@manageBillingButton')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('.v-list__tile')
        .contains(/update card details/i)
        .click()

      cy.get('[data-cy=updateCardDetailsHeading]')
        .invoke('text')
        .should('exist')
        .and('match', /update card details/i)

      cy.get('[data-cy=modalForm]:visible')
        .find('button')
        .contains(/cancel/i)
        .click()

      cy.log('Invoices and billing address links are displayed')

      cy.get('@manageBillingButton')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('.v-list__tile')
        .contains(/view and download invoices/i)

      cy.get('.v-menu__content.menuable__content__active')
        .find('.v-list__tile')
        .contains(/view and update billing address/i)
    })

    it('opens confirm dialog on clicking "Delete account"', function () {
      cy.get('@deleteAccountButton')
        .click()
      cy.get('[data-cy=modalForm]:visible')
        .contains(/delete account/i)
      cy.get('@deleteConfirmationField')
        .should('be.visible')
    })

    it('displays error on confirming delete without correct confirmation input', function () {
      cy.get('@deleteAccountButton')
        .click()

      // Submit without value
      cy.get('[data-cy=modalForm]:visible')
        .submit()
      cy.get('@deleteConfirmationField')
        .contains(/the confirmation field is required/i)

      // Submit with invalid value
      cy.get('@deleteConfirmationField')
        .type('no')
      cy.get('[data-cy=modalForm]:visible')
        .submit()
      cy.get('@deleteConfirmationField')
        .contains(/Please enter \".+\"/i)
    })

    it('checkout handover is working properly', function () {
      cy.request(`${Cypress.env('API_PATH')}/handover/checkout`).then((response) => {

        cy.log('opens upgrade page')
        cy.request(`${response.body.baseUrl}/upgrade`)
          .its('body')
          .should('include', '</html>')
          .and('include', 'Choose your new plan')

        cy.log('opens invoices page')
        cy.request(`${response.body.baseUrl}/list-invoices`)
          .its('body')
          .should('include', '</html>')
          .and('include', 'Your invoices')

        cy.log('opens billing address page')
        cy.request(`${response.body.baseUrl}/change-billing-address`)
          .its('body')
          .should('include', '</html>')
          .and('include', 'Edit your billing address')
      })
    })
  })
})
