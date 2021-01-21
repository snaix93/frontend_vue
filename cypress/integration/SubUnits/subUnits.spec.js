describe('SubUnits', function () {
  const subUnit = Cypress.env('DEFAULT_CUSTOMER')
  const apiPath = `${Cypress.env('API_PATH')}/sub-units`
  const teamSettingsApiPath = `${Cypress.env('API_PATH')}/team-settings`

  context('Sub-units Page', function () {
    beforeEach(function () {
      cy.server()

      cy.login()

      // make sure sub-unit management is enabled
      cy.request('PUT', `${teamSettingsApiPath}`, { subUnitManagementEnabled: true })
        .then((response) => {
          expect(response.status).to.eq(200)
        })

      cy.visit('/sub-units')

      cy.route(apiPath).as('getSubUnits')
      cy.route('POST', apiPath).as('postSubUnit')
      cy.route('PUT', `${apiPath}/*`).as('putSubUnit')
      cy.route('DELETE', `${apiPath}/*`).as('deleteSubUnit')

      cy.wait('@getSubUnits')

      cy.get('[data-cy=subUnitsList]')
        .as('subUnitsList')

      cy.get('[data-cy=createButton]')
        .as('addSubUnitButton')

      cy.get('@subUnitsList')
        .contains(/rows per page\:/i)
        .parent()
        .find('.v-select')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('.v-list__tile')
        .last()
        .click()
    })

    it('displays a button containing "add sub-unit"', () => {
      cy.get('@addSubUnitButton')
        .contains(/add sub-unit/i)
    })

    it('displays errors on submitting empty required fields', () => {
      cy.get('@addSubUnitButton')
        .click()

      cy.get('[data-cy=modalForm]:visible')
        .as('subUnitForm')
        .submit()

      cy.get('[data-cy=subUnitShortIdFormGroup]')
        .contains(/the shortid field is required/i)

      cy.get('[data-cy=subUnitNameFormGroup]')
        .contains(/the name field is required/i)
    })

    it('successfully creates a sub-unit', () => {
      // Check if host already exists and delete it if needed
      cy.log('Delete default subUnit if it already exists')
      cy.deleteSubUnit(subUnit)

      // Reload page and wait for getSubUnits request
      cy.visit('/sub-units')
      cy.wait('@getSubUnits')

      // Create subUnit
      cy.log('Create subUnit')

      cy.get('@addSubUnitButton')
        .click()

      cy.get('[data-cy=subUnitShortIdFormGroup]')
        .find('input')
        .type(subUnit)

      cy.get('[data-cy=subUnitNameFormGroup]')
        .find('input')
        .type(subUnit)

      cy.get('[data-cy=modalForm]:visible')
        .submit()

      cy.wait('@postSubUnit')

      cy.get('@subUnitsList')
        .contains(subUnit)
    })

    it('displays error on entering already existing shortId', () => {

      cy.get('@addSubUnitButton')
        .click()

      cy.get('[data-cy=subUnitShortIdFormGroup]')
        .find('input')
        .type(subUnit)

      cy.get('[data-cy=subUnitNameFormGroup]')
        .find('input')
        .type(subUnit)

      cy.get('[data-cy=modalForm]:visible')
        .submit()

      cy.get('[data-cy=subUnitShortIdFormGroup]')
        .contains(/there is already a sub-unit with this short id/i)
    })

    it('successfully edits and deletes a sub-unit', () => {

      cy.get('@subUnitsList')
        .contains(subUnit)
        .parents('tr')
        .as('tableRowWithSubUnit')

      // Edit subUnit
      cy.log(`Change subUnit's name`)

      cy.get('@tableRowWithSubUnit')
        .find('[data-cy=subUnitActionsButton]').as('subUnitActionsButton')

      cy.get('@subUnitActionsButton')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('[data-cy=editSubUnitButton]')
        .click()

      cy.get('[data-cy=subUnitNameFormGroup]')
        .find('input')
        .type(': name changed')

      cy.get('[data-cy=modalForm]:visible')
        .submit()

      cy.wait('@putSubUnit')

      cy.get('@tableRowWithSubUnit')
        .contains(`${subUnit}: name changed`)

      // Delete subUnit
      cy.log('Delete subUnit')

      cy.get('@subUnitActionsButton')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('[data-cy=deleteSubUnitButton]')
        .click()

      cy.get('[data-cy=dialogConfirmButton]:visible')
        .click()

      cy.wait('@deleteSubUnit')

      cy.get('@subUnitsList')
        .contains(subUnit)
        .should('not.exist')
    })
  })
})
