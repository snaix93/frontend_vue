describe('Dashboard - General', function () {
  context('Navigation / Routing', function() {
    beforeEach(function () {
      cy.login();
    });

    it('should visit host dashboard when visiting root', function () {
      cy.visit('/');
      cy.location('pathname').should('equal', '/dashboard/hosts');
    });

    it('should visit host dashboard when visiting dashboard index', function () {
      cy.visit('/dashboard');
      cy.location('pathname').should('equal', '/dashboard/hosts');
    });
  });
});
