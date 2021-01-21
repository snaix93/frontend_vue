describe('Dashboard', function () {
  const host = Cypress.env('DEFAULT_HOST');
  const tag = Cypress.env('DEFAULT_TAG');
  const subUnit = Cypress.env('DEFAULT_CUSTOMER');
  const teamSettingsApiPath = `${Cypress.env('API_PATH')}/team-settings`;

  context('Dashboard settings', function () {

    beforeEach(function () {
      cy.login();
      cy.visit('/');
      cy.server();

      cy.route(`${Cypress.env('API_PATH')}/hosts/?dashboard=1&summary=1&withIssues=0&limit=24`)
        .as(
        'getHostsForDashboard');
      cy.route(`${Cypress.env('API_PATH')}/hosts/?eventsOnly=1&summary=1&withIssues=1`).as('getEvents');
      cy.route(`${Cypress.env('API_PATH')}/host-tags`).as('getHostTags');
      cy.route(`${Cypress.env('API_PATH')}/summary/by-customers`).as('getSummaryByCustomers');

      // Enable sub-unit management and create default sub-unit and default host
      cy.log('Enable sub-unit management, add default sub-unit and host');
      cy.request('PUT', `${teamSettingsApiPath}`, { subUnitManagementEnabled: true })
        .then((response) => {
          expect(response.status).to.eq(200);
        });
      cy.createSubUnit();
      cy.createHost();
    });

    it('Switches between all 5 host modes', function () {

      cy.get('[data-cy="hostSortingSelect"]').as('hostSortingSelect');

      cy.log('Displays all hosts');
      cy.get('@hostSortingSelect').click();
      cy.get('[data-cy="dashboard.allHosts"]').click();
      cy.wait('@getHostsForDashboard');
      cy.get('[data-cy="hostsView"]').should('exist');

      cy.log('Displays hosts grouped by tags');
      cy.get('@hostSortingSelect').click();
      cy.get('[data-cy="dashboard.hostsGroupedByTags"]').click();
      cy.wait('@getHostTags');
      cy.get(`[data-cy="${tag}"]`).should('exist');

      cy.log('Displays events table');
      cy.get('@hostSortingSelect').click();
      cy.get('[data-cy="phrase.event"]').click();
      cy.wait('@getEvents');
      cy.get(`[data-cy="eventsTable"]`).should('exist');

      cy.log('Displays hosts grouped by subUnit');
      cy.get('@hostSortingSelect').click();
      cy.get('[data-cy="dashboard.hostsGroupedByCustomers"]').click();
      cy.wait('@getSummaryByCustomers');
      cy.get('[data-cy=groupedByCustomer]').should('be.visible').contains(subUnit, { matchCase: false });

      cy.log('Displays hosts filtered by customers');
      cy.get('@hostSortingSelect').click();
      cy.get('[data-cy="dashboard.hostsFilteredByCustomer"]').click();
      cy.get('[data-cy="customerFilter"]:visible').click();
      cy.get('.v-menu__content.menuable__content__active')
        .find('.v-list__tile').contains(subUnit)
        .first()
        .click();
      cy.get(`[data-cy="${host}"]`).should('exist').and('be.visible');
    });

    it('Switches between views', function () {

      cy.wait('@getHostsForDashboard');

      cy.log('Displays mini tiles');
      cy.get('[value="mini"]').click();
      cy.get(`[data-cy="miniView"]`).should('exist');

      cy.log('Displays default tiles');
      cy.get('[value="tile"]').click();
      cy.get(`[data-cy="tileView"]`).should('exist');

      cy.log('Displays list');
      cy.get('[value="list"]').click();
      cy.get(`[data-cy="listView"]`).should('exist');
    });

    it('Changes auto-refresh rate', function () {

      cy.wait('@getHostsForDashboard');
      cy.get('[data-cy="autoRefreshRateSlider"]', { timeout: 6000 }).find('input').as('slider');
      cy.get('[ data-cy="refresherTimeRemaining"]').as('refreshDisplay');

      cy.get('[data-cy="settingsButton"]').click();
      cy.get('@refreshDisplay').then(($span) => {
        let seconds = parseFloat($span.attr('data-cy-val'));
        // Move to 30s
        cy.get('@slider').click(15, 40, { force: true }).then(() => {
          seconds = parseFloat($span.attr('data-cy-val'));
          expect(seconds).to.be.lessThan(31);
        });
        // Move to 90s
        cy.get('@slider').click(150, 40, { force: true }).then(() => {
          seconds = parseFloat($span.attr('data-cy-val'));
          expect(seconds).to.be.lessThan(91);
        });
        // Move to 120s
        cy.get('@slider').click(230, 40, { force: true }).then(() => {
          seconds = parseFloat($span.attr('data-cy-val'));
          expect(seconds).to.be.lessThan(121);
        });
      });
    });
  });

});
