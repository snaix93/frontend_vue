describe("Create/Delete host and ICMP Ping check", function(){
  const host = Cypress.env('DEFAULT_HOST')
  const connect = Cypress.env('DEFAULT_HOST')
  const tag = Cypress.env('DEFAULT_TAG')
  const userSettings = {
    settings: {
      autoShow: {
        hostCheckSuccess:false,
        agentSetupHelp:false,
        hostGuide:false
      }
    }
  }

  const hostsPath = '/hosts'
  const createHostPath = '/hosts/create'
  const userSettingApiPath = `${Cypress.env('API_PATH')}/user-settings`

  context('Hosts Page', function () {

    beforeEach(function () {
      cy.server()
      cy.login()

      // Make sure guide dialog and host check success dialog are not showing up
      // by setting the appropriate user settings
      cy.log('Reset user settings')
      cy.request('PUT', `${userSettingApiPath}`, userSettings)
        .then((response) => {
          expect(response.status).to.eq(200)
        })

      cy.fixture('hostValidateSuccess').as('hostValidateSuccess')

      // Cache routes
      cy.route('POST', `${Cypress.env('API_PATH')}/validate/host`, '@hostValidateSuccess').as('validateHost')
      cy.route('POST',`${Cypress.env('API_PATH')}/hosts`).as('postHosts')
    })

    it('Opens create host form from hosts list', function () {
      cy.visit(hostsPath)
      cy.get('[data-cy=createButton]').click()
      cy.url().should('include', createHostPath)
    })

    it('Creates public host, adds ping check and waits for status, removes ping check', function () {

      // Check if host already exists and delete it if needed
      cy.log('Delete host if it already exists')
      cy.deleteHost(host)

      // Create Host
      cy.log('Create host')
      cy.visit(createHostPath)

      cy.get('[data-cy=hostForm]').as('hostForm')

      cy.get('[data-cy=addHostName]')
        .type(host)
      cy.get('[data-cy=connect]')
        .type(connect)
      cy.get('[data-cy=addTag]')
        .type(tag + '{enter}')

      cy.get('@hostForm').then(($hostForm) => {
        // if user didn't add any frontmen yet, the frontman select won't be present in the DOM
        // therefore only interact with it if it's present
        if ($hostForm.find('[data-cy=frontman]').length) {
          cy.get('[data-cy=frontman]').click()
          cy.get('.v-menu__content.menuable__content__active:visible')
            .find('.v-list__tile')
            .first()
            .click()
        }
      })

      cy.get('@hostForm').submit()
      cy.wait('@validateHost')
      cy.wait('@postHosts')
      cy.url().should('contain', 'host-added')

      // Add ICMP ping check
      cy.log('Create Ping check')
      cy.get('[data-cy=ICMPCheckAddButton]').click()
      cy.get('[data-cy=icmpForm]', { timeout: 4000 }).submit()

      // Wait for the ping to become green
      cy.log('Waiting for the ping to become green')
      var genArr = Array.from({length:80},(v,k)=>k+1)
      cy.wrap(genArr).each((index) => {
        cy.get('[data-cy=lastSuccess]').then(($btn) => {
          if (!$btn.hasClass('last-Success-1')) {
            cy.wait(1000)
          }
        })
      })

      // Remove ping check
      cy.log('Remove Ping')
      cy.get('[data-cy=deleteIcmpPing]').click()
      cy.get('.v-dialog__content--active [data-cy=dialogConfirmButton]').click()
      cy.get('[data-cy=deleteIcmpPing]').should('not.exist')
    })

  })

})
