describe('FailOps Lab Frontend Staging Tests', () => {

  before(() => {
    // Runs once before all tests
    // BASE_URL is already set in cypress.config.js
    cy.visit('/');
  });

  it('should display main header', () => {
    cy.get('h1').contains('FailOps Lab').should('be.visible');
  });

  it('should navigate to API status page', () => {
    cy.request('/api/status').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', '✅ App running fine!');
    });
  });

});

