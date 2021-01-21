describe("Learn & Support", function(){
  const tutorials = ['linux', 'windows', 'internet', 'telegram', 'frontman']
  const playVideo = 'playVideoButton_';
  const videoHeadline = 'videoHeadline_';

  const subjectText = 'The subject field is required';
  const bodyText = 'The body field is required';
  context('Learn & Support Page', function () {
    beforeEach(function () {
      cy.server()

      cy.login()

      cy.visit('/learn')
      cy.get('[data-cy=openSupportDialog').as('openSupportDialog');
      cy.get('[data-cy=supportDialogForm]').as('supportDialogForm');
    })

    it('Checks if tutorials and buttons are present', function () {
      cy.wrap(tutorials).each((item, i, array) => {
        cy.get('[data-cy='+ playVideo + item +']').should('exist')
        cy.get('[data-cy='+ videoHeadline + item +']').should('exist')
        })

      cy.get('[data-cy=docsButton]').should('exist')

    })

    it('Checks if submit errors are displayed', function () {

      cy.get('@openSupportDialog').click();
      cy.get('@supportDialogForm').submit();

      cy.get('[data-cy=subjectInput]')
        .contains(/the subject field is required/i)
      cy.get('[data-cy=bodyInput]')
        .contains(/the body field is required/i)
    });

    it('Submits the form', function () {
      cy.get('@openSupportDialog').click();
      cy.get('[data-cy=subjectInput]')
        .type(subjectText)
      cy.get('[data-cy=bodyInput]')
        .type(subjectText + bodyText)

      cy.log('Uploads the image')
      cy.get('[data-cy="imageInput"]').attachFile('test_image/cypress_test.jpg');

      cy.get('@supportDialogForm').submit();

      cy.get('[data-cy=requestSubmitted]').click();
    });

  })
})
