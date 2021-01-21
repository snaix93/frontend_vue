declare namespace Cypress {
    interface Chainable<Subject> {
        /**
         * Creates sub-unit programmatically
         * @examples
         * cy.createSubUnit()
         */
        createSubUnit(): Chainable<any>
        /**
         * Deletes sub-unit programmatically specified by its shortId
         * @examples
         * cy.deleteSubUnit('shortId')
         */
        deleteSubUnit(_subUnit: string): Chainable<any>
        /**
         * Creates host programmatically with optional name and connect arguments
         * if the arguments are not provided data is taken from cypress.env.json
         * @examples
         * cy.createHost()
         * cy.createHost('some host', 'host.hostgum.eu')
         */
        createHost(_name?: string, _connect?: string): Chainable<any>
        /**
         * Deletes host programmatically specified by its name
         * @examples
         * cy.deleteHost('host')
         */
        deleteHost(_host: string): Chainable<any>
        /**
         * Performs programmatic login with optional username and password arguments
         * if the arguments are not provided login data is taken from cypress.env.json
         * @examples
         * cy.login('user@email.com', 'Password123')
         * cy.login()
         */
        login(_username?: string, _password?: string): Chainable<any>
        /**
         * Make cy.request to authenticated route by adding token to headers.
         * Must be logged in before using this by called cy.login().
         *
         * Forwards to cy.request, honouring following syntax:
         *
         * cy.request(url)
         * cy.request(url, body)
         * cy.request(method, url)
         * cy.request(method, url, body)
         * cy.request(options)
         */
        authedRequest(param1?: string, param2?: string, param3?: object): Chainable<any>
    }
}
