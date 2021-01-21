describe('Dashboard - Hosts', function () {
  const host = Cypress.env('DEFAULT_HOST');
  const tag = Cypress.env('DEFAULT_TAG');
  const subUnit = Cypress.env('DEFAULT_CUSTOMER');

  beforeEach(function () {
    cy.server();

    cy.apiRoute('GET', '/hosts*').as('GET/hosts');
    cy.apiRoute('PUT', '/user-settings', []).as('PUT/user-settings');

    cy.login();
    cy.visit('/dashboard/hosts');
  });

  context('Dashboard settings', function () {
    beforeEach(function () {
    //   // Enable sub-unit management and create default sub-unit and default host
    //   cy.log('Enable sub-unit management, add default sub-unit and host');
    //   cy.authedRequest('PUT', '/team-settings', {
    //       settings: {
    //         subUnitManagementEnabled: true
    //       }
    //     })
    //     .then((response) => {
    //       expect(response.status).to.eq(202);
    //     });
    //
    //   cy.createSubUnit();
    //   cy.createHost();
    });

    it('should load list of hosts for dashboard', function () {
      cy.wait('@GET/hosts');
      cy.getByData('dashboard:hosts').should('be.visible');
    });

    it('should switch between view types on hosts dashboard', function () {
      cy.apiRoute('PUT', '/user-settings', []).as('PUT/user-settings');
      cy.wait('@GET/hosts');

      cy.getByData('dashboard:view-toggle:mini')
        .should('be.visible')
        .click();
      cy.getByData('dashboard:host:mini-card').should('be.visible');
      cy.getByData('dashboard:host:medium-card').should('not.be.visible');
      cy.getByData('dashboard:host:list-item').should('not.be.visible');

      cy.getByData('dashboard:view-toggle:list')
        .should('be.visible')
        .click();
      cy.getByData('dashboard:host:mini-card').should('not.be.visible');
      cy.getByData('dashboard:host:medium-card').should('not.be.visible');
      cy.getByData('dashboard:host:list-item').should('be.visible');

      cy.getByData('dashboard:view-toggle:medium')
        .should('be.visible')
        .click();

      cy.getByData('dashboard:host:mini-card').should('not.be.visible');
      cy.getByData('dashboard:host:medium-card').should('be.visible');
      cy.getByData('dashboard:host:list-item').should('not.be.visible');
    });

    it('should persist view type change to backend', function () {
      cy.wait('@GET/hosts');

      cy.getByData('dashboard:view-toggle:mini')
        .should('be.visible')
        .click();

      cy.wait('@PUT/user-settings').then((xhr) => {
        expect(xhr.status).to.eq(200);
        expect(xhr.requestBody.settings.dashboard.view).to.eq('card_mini');
      });

      cy.getByData('dashboard:view-toggle:medium')
        .should('be.visible')
        .click();

      cy.wait('@PUT/user-settings').then((xhr) => {
        expect(xhr.status).to.eq(200);
        expect(xhr.requestBody.settings.dashboard.view).to.eq('card_medium');
      });

      cy.getByData('dashboard:view-toggle:list')
        .should('be.visible')
        .click();

      cy.wait('@PUT/user-settings').then((xhr) => {
        expect(xhr.status).to.eq(200);
        expect(xhr.requestBody.settings.dashboard.view).to.eq('list');
      });
    });

    it('should be able to aggregate by tags', function () {
      cy.wait('@GET/hosts');
      cy.getByData('dashboard:view-toggle:medium').click();
      cy.getByData('aggregate:group').should('be.visible').click();

      cy.getByData('dashboard:medium-card').should('be.visible');
      cy.getByData('dashboard:mini-card').should('not.be.visible');
      cy.getByData('dashboard:list-item').should('not.be.visible');
    });

    it('should be able to change views when aggregated by tags', function () {
      cy.wait('@GET/hosts');
      cy.getByData('aggregate:group')
        .should('be.visible')
        .click();
      cy.getByData('dashboard:host:aggregated:medium-card').should('be.visible');
      cy.getByData('dashboard:host:aggregated:mini-card').should('be.visible');
      cy.getByData('dashboard:host:aggregated:list-item').should('be.visible');
    });

    // it('should aggregate by sub units', function () {
    //
    // });
    //
    // it('should filter by tag', function () {
    //
    // });
    //
    // it('should filter by group', function () {
    //
    // });
    //
    // it('should filter by sub unit', function () {
    //
    // });

    it.skip('Switches between all 5 host modes', function () {

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
      cy.get('[data-cy=groupedByCustomer]')
        .should('be.visible')
        .contains(subUnit, { matchCase: false });

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


    it.skip('Changes auto-refresh rate', function () {

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
