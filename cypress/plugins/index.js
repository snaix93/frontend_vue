/// <reference types="cypress" />
// ***********************************************************
// Use to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // enable overriding of baseUrl config var by env var from cypress.env.json
  // https://github.com/cypress-io/cypress/issues/909#issuecomment-578505704
  const baseUrl = config.env.BASE_URL || null;
  if (baseUrl) {
    config.baseUrl = baseUrl;
  }

  return config;
}
