import './commands'

before(function() {
  cy.wrap(Cypress.env('API_PATH')).as('apiUrl');
});
