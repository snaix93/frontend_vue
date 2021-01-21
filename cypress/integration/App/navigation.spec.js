describe("Navigation", function() {
  const teamSettingsApiPath = `${Cypress.env('API_PATH')}/team-settings`
  const nonExistingPath = '/nonexistingpath'

  beforeEach(function () {
    cy.login()
    cy.visit('/')
  })

  it('successfully opens pages and displays respective content', function () {

    // make sure sub-unit management is enabled so nav item is present
    cy.request('PUT', `${teamSettingsApiPath}`, { subUnitManagementEnabled: true })
      .then((response) => {
        expect(response.status).to.eq(200)
      })

    // getHosts pages from fixtures and loop through array
    cy.fixture('pages').then(pages => {
      pages.forEach((page) => {
        cy.log(`navigate to ${page.path}`)

        // getHosts the menu item and click on it
        cy.get(`[data-cy=${page.key}]`, { timeout: 5000 }).click()

        // the url should contain the respective page's path
        cy.url({ timeout: 7000 }).should('include', page.path)

        // page toolbar and footer should be visible
        // and if a title is defined the page's toolbar should contain it
        cy.get('[data-cy=pageToolbar]:visible', { timeout: 7000 }).as('pageToolbar')
        if(page.hasOwnProperty('title')) {
          cy.get('@pageToolbar').should('contain', page.title)
        }

        // footer should be visible
        cy.get('[data-cy=appFooter]').should('be.visible')

        // elements in the content that should be visible
        page.content.forEach((selector) => {
          cy.get(`[data-cy=${selector}]`).should('be.visible')
        })
      })
    })
  })

  it('displays 404 page if wrong path was entered', function () {
    // try to visit non existing page
    cy.visit(nonExistingPath, {failOnStatusCode: false})

    // url should include the wrong path, the right message should be displayed
    // and a button to go back to homepage should exist
    cy.url().should('include', nonExistingPath)
    cy.get('[data-cy=errorPageNotFoundMessage]').should('contain', 'Page not found')
    cy.get('[data-cy=errorPageHomeButton]').should('exist')
  })

  it('verifies footer links have the correct targets', function () {
    const lpDomain = 'https://cloudradar.io'

    cy.get('[data-cy=appFooterLinkFeedback]').should('have.prop', 'href', 'mailto:service@cloudradar.io')
    cy.get('[data-cy=appFooterLinkTerms]').should('have.prop', 'href', `${lpDomain}/service-terms`)
    cy.get('[data-cy=appFooterLinkPrivacy]').should('have.prop', 'href', `${lpDomain}/privacy-policy`)
    cy.get('[data-cy=appFooterLinkImprint]').should('have.prop', 'href', `${lpDomain}/imprint`)
  })

})
