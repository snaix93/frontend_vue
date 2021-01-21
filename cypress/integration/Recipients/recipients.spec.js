import { generateTestEmail } from '../../support/util'

describe('Recipients', function () {
  const mediatypes = {
    email: {
      key: 'email',
      selector: /e\-mail/i,
    },
    slack: {
      key: 'slack',
      selector: /slack/i,
      hasOption1: true,
    },
    msteams: {
      key: 'msteams',
      selector: /msteams/i,
    },
    telegram: {
      key: 'telegram',
      selector: /telegram/i,
      hasOption1: true,
    },
    pushover: {
      key: 'pushover',
      selector: /pushover/i,
    },
    phonecall: {
      key: 'phone',
      selector: /sms/i,
    },
    sms: {
      key: 'phone',
      selector: /phone call/i,
    },
    integromat: {
      key: 'integromat',
      selector: /integromat/i,
    },
    webhook: {
      key: 'webhook',
      selector: /web hook/i,
      hasOption1: true,
    }
  };
  let allowedMediaTypes = [];

  context('Recipients Page', function () {
    beforeEach(function () {
      cy.server()

      cy.login()

      cy.route('GET', `${Cypress.env('API_PATH')}/user`).as('getUser')
      cy.route('GET', `${Cypress.env('API_PATH')}/recipients*`).as('getRecipients')
      cy.route('POST', `${Cypress.env('API_PATH')}/recipients`).as('postRecipient')
      cy.route('PUT', `${Cypress.env('API_PATH')}/recipients/*`).as('updateRecipient')
      cy.route('DELETE', `${Cypress.env('API_PATH')}/recipients/*`).as('deleteRecipient')

      cy.visit('/recipients')

      cy.wait('@getUser').then(({response}) => {
        const teamSettings = response.body.data.team;
        allowedMediaTypes = teamSettings.allowedMediaTypes
                                    .filter((key) => mediatypes[key] !== undefined)
                                    .map((key) => mediatypes[key]);
      })

      cy.wait('@getRecipients')

      cy.get('[data-cy=recipientsList]')
        .as('recipientsList')

      cy.get('[data-cy=createButton]')
        .as('addRecipientButton')

      cy.get('@recipientsList')
        .contains(/rows per page\:/i)
        .parent()
        .find('.v-select')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('.v-list__tile')
        .last()
        .click()
    })

    it('should show the "Add Recipient" button', () => {
      cy.get('@addRecipientButton')
        .should('be.visible')
    })

    it('should be able to change input elements according to the selected media type', () => {

        cy.get('@addRecipientButton')
          .click()

        for(let mediatype of allowedMediaTypes) {
          cy.log(`Testing media type: ${mediatype.key}`)

          cy.get('[data-cy=mediatype]')
            .parents('.v-select')
            .click()

          cy.get('.v-menu__content.menuable__content__active')
            .contains(mediatype.selector)
            .click()

          cy.get(`[data-cy=${mediatype.key}-sendto]`)
            .and('be.visible')

          if(!!mediatype.hasOption1)
            cy.get(`[data-cy=${mediatype.key}-option1]`, {timeout: 6000})
              .and('be.visible')
        }
    })

    it('should not allow the sendto field to be empty', () => {
      cy.get('@addRecipientButton')
        .click()

      cy.wait(500)

      cy.get('[data-cy=mediatype]')
        .parents('.v-select')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .contains(mediatypes.email.selector)
        .click()

      cy.get('[data-cy=modalForm]:visible')
        .submit()

      cy.get('[data-cy=sendtoFormGroup]')
        .contains(/the e-mail field is required/i)
    })

    it('should be able create recipients, update recipients and delete recipients', () => {
      const alertsExp = /alerts/i;
      const testEmail = generateTestEmail();

      cy.log('1. Test: creating recipients')

      cy.get('@addRecipientButton')
        .click()

      cy.wait(500)

      cy.get('[data-cy=mediatype]')
        .parents('.v-select')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .contains(mediatypes.email.selector)
        .click()

      cy.get('[data-cy=sendtoFormGroup] input')
        .type(testEmail)

      cy.get('[data-cy=modalForm]:visible')
        .submit()

      cy.wait('@postRecipient')
      cy.wait('@getRecipients')
      cy.wait(500)

      cy.log('2. Test: updating recipients')

      cy.get('@recipientsList')
        .contains(testEmail)
        .parents('tr')
        .as('tableRowWithTestEmail')

      cy.get('@tableRowWithTestEmail')
        .contains(alertsExp)

      cy.get('@tableRowWithTestEmail')
        .find('[data-cy=recipientActionsButton]')
        .as('recipientActionsButton')

      cy.get('@recipientActionsButton')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('[data-cy=resendVerificationLinkButton]')

      cy.get('.v-menu__content.menuable__content__active')
        .find('[data-cy=editRecipientButton]')
        .click()

      cy.wait(500)

      cy.get('[data-cy=modalForm]:visible')
        .find('.v-input[data-cy=recipientAlertsCheckbox]')
        .find('.v-input--selection-controls__input')
        .click()

      cy.get('[data-cy=modalForm]:visible')
        .submit()

      cy.wait('@updateRecipient')

      cy.get('@tableRowWithTestEmail')
        .contains(alertsExp)
        .should('not.exist')

      cy.log('3. Test: activating recipients')

      cy.get('@tableRowWithTestEmail')
        .find('.v-input[data-cy=recipientActiveToggle]')
        .as('recipientActiveToggle')

      cy.get('@recipientActiveToggle')
        .find('input')
        .should('have.attr', 'aria-checked', 'false')

      cy.get('@recipientActiveToggle')
        .find('.v-input--selection-controls__input')
        .click()

      cy.get('@recipientActiveToggle')
        .find('input')
        .should('have.attr', 'aria-checked', 'true')

      cy.wait('@updateRecipient')

      cy.log('4. Test: delete recipients')

      cy.get('@recipientActionsButton')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('[data-cy=deleteRecipientButton]')
        .click()

      cy.get('[data-cy=dialogConfirmButton]:visible')
        .click()

      cy.wait('@deleteRecipient')

      cy.get('@recipientsList')
        .contains(testEmail)
        .should('not.exist')
    })
  })
})
