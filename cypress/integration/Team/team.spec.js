import { generateTestEmail } from '../../support/util'

describe('Team', function () {
  const GUEST_ROLE = /Guest \(read only\)/i;
  const SUPPORT_ROLE = /Support \(automatically deleted after 24 hours\)/i;

  context('Team Page', function () {
    before(function() {
      cy.log('Delete possibly existing support member')

      cy.server()
      cy.login()

      cy.createHost()
      cy.createSubUnit()

      cy.visit('/team')

      cy.route('DELETE', `${Cypress.env('API_PATH')}/team-members/*`).as('deleteMember')

      cy.get('[data-cy=teamMembersList]')
        .as('teamMembersList')

      cy.get('@teamMembersList')
        .contains(/rows per page\:/i)
        .parent()
        .find('.v-select')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('.v-list__tile')
        .last()
        .click()

      cy.get('@teamMembersList').then(($list) => {
        if ($list.text().includes('Support')) {
          cy.get('@teamMembersList')
            .contains(SUPPORT_ROLE)
            .parents('tr')
            .as('tableRowWithSupportMember')

          cy.get('@tableRowWithSupportMember')
            .find('[data-cy=memberActionsButton]')
            .as('memberActionsButton')

          cy.get('@memberActionsButton')
            .click()

          cy.get('.v-menu__content.menuable__content__active')
            .find('[data-cy=deleteMemberButton]')
            .click()

          cy.get('[data-cy=dialogConfirmButton]:visible')
            .click()

          cy.wait('@deleteMember')

          cy.get('@teamMembersList')
            .contains(SUPPORT_ROLE)
            .should('not.exist')
        }
      })
    })

    beforeEach(function () {
      cy.server()

      cy.login()

      cy.visit('/team')

      cy.route('POST', `${Cypress.env('API_PATH')}/team-members`).as('postMember')
      cy.route('DELETE', `${Cypress.env('API_PATH')}/team-members/*`).as('deleteMember')

      cy.get('[data-cy=teamMembersList]')
        .as('teamMembersList')

      cy.get('[data-cy=createButton]')
        .as('inviteTeamMemberButton')

      cy.get('@teamMembersList')
        .contains(/rows per page\:/i)
        .parent()
        .find('.v-select')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('.v-list__tile')
        .last()
        .click()
    })

    it('should be able to grant access to support', () => {
      cy.get('[data-cy=grantAccessToSupport]')
        .as('grantAccessToSupportButton')

      cy.get('@grantAccessToSupportButton')
        .click()

      cy.get('.v-dialog.v-dialog--active')
        .as('grantAccessToSupportDialog')
        .contains(/do you want to grant the support access/i)

      cy.get('@grantAccessToSupportDialog')
        .find('.v-btn__content')
        .contains(/confirm/i)
        .click()

      cy.wait('@postMember')

      cy.get('@teamMembersList')
        .contains(SUPPORT_ROLE)
    })

    it('should show the "Invite Team Member" button', () => {
      cy.get('@inviteTeamMemberButton')
        .and('be.visible')
    })

    it('should not allow the email field to be empty', () => {
      cy.get('@inviteTeamMemberButton')
        .click()

    cy.get('[data-cy=modalForm]:visible')
      .submit()

      cy.get('[data-cy=emailFormGroup]')
        .contains(/the email field is required/i)
    })

    it('should be able create members, update members and delete members', () => {
      const testEmail = generateTestEmail();

      cy.log('1. Test: creating members')

      cy.route('POST', `${Cypress.env('API_PATH')}/team-members`).as('postMember')

      cy.get('@inviteTeamMemberButton')
        .click()

      cy.get('[data-cy=emailFormGroup] input')
        .type(testEmail)

      cy.get('[data-cy=modalForm]:visible')
        .submit()

      cy.wait('@postMember')

      cy.get('@teamMembersList')
        .contains(testEmail)
        .parent('tr')
        .as('tableRowWithTestEmail')

      cy.log('2. Test: resending invitations')

      cy.get('@tableRowWithTestEmail')
        .find('[data-cy=memberActionsButton]')
        .as('memberActionsButton')

      cy.get('@memberActionsButton')
        .click()

      cy.route('GET', `${Cypress.env('API_PATH')}/team-members/*/resend-invitation`).as('resendInvite')

      cy.get('[data-cy=resendInvitationButton]:visible')
        .click()

      cy.wait('@resendInvite')

      cy.log('3. Test: changing member role')

      cy.route('PUT', `${Cypress.env('API_PATH')}/team-members/*`).as('putMember')

      cy.get('@tableRowWithTestEmail')
        .find('.roleSelect')
        .as('roleSelect')

      cy.get('@roleSelect')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .contains(GUEST_ROLE)
        .click()

      cy.wait('@putMember')

      cy.get('@roleSelect')
        .contains(GUEST_ROLE)

      cy.log('4. Test: changing tag selection')

      cy.get('@tableRowWithTestEmail')
        .find('.tagSelect')
        .as('tagSelect')

      cy.get('@tagSelect')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('.v-list__tile')
        .first()
        .as('firstTagOption')

      cy.get('@firstTagOption')
        .click()

      cy.wait('@putMember')

      cy.get('@tagSelect')
        .find('.v-chip')

      cy.log('5. Test: changing subUnit selection')

      cy.get('@tableRowWithTestEmail')
        .find('.subUnitSelect')
        .as('subUnitSelect')

      cy.get('@subUnitSelect')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('.v-list__tile')
        .first()
        .as('firstCustomerOption')

      cy.get('@firstCustomerOption')
        .click()

      cy.wait('@putMember')

      cy.get('@subUnitSelect')
        .find('.v-select__selection')

      /* 5. TEST DELETING MEMBERS */

      cy.get('@memberActionsButton')
        .click()

      cy.wait(500)

      cy.get('.v-menu__content.menuable__content__active')
        .find('[data-cy=deleteMemberButton]:visible')
        .click()

      cy.get('[data-cy=dialogConfirmButton]:visible')
        .click()

      cy.wait('@deleteMember')

      cy.get('@teamMembersList')
        .contains(testEmail)
        .should('not.exist')
    })
  })
})
