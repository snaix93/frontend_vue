# Cypress 

> A test runner with cross-browser compatibility.
## Install Cypress
If you have downloaded the code from bitbucket, cypress should be already installed on your local server, in case you don't have cypress run the command:
``` bash
npm install cypress
```

## Config
Copy `cypress.env.example.json` and rename to `cypress.env.json`. 
Inside adjust environment variables to match your environment needs. 

Please avoid using `susan@cloudradar.io` as default user for you local testing, because it is being used for the bitbucket pipeline when code gets pushed to Staging.

## Run Tests
To run all existing tests write this command in your terminal:
``` bash
npm run cypress:run
```

To run a specific test:
``` bash
npm run cypress:run --spec "cypress/integration/**/spec-to-run.js"
```

More possible arguments are documented here: https://docs.cypress.io/guides/guides/command-line.html#How-to-run-commands

## Open Cypress
If you want to run tests in the Cypress Test Runner:
``` bash
npm run cypress:open
```

Cypress will open a window in chrome in incognito mode where it's possible to select and run a test and see it "in action". 

## Headless Run
Before running cypress on Linux machine you will need to install few libraries:

```bash
apt-getHosts install libgtk2.0-0 libgtk-3-0 libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
```

## Good to know
### Write tests
Everything regarding tests is being done in the `cypress` folder.
* if you want to add a test, create a file `sample.spec.js` within the `cypress/integration` directory (please group related tests into subdirectories, using the same structure as in `components`)
* refer to the Cypress docs for [further explanation on the folder structure](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Folder-Structure)

### Custom commands
Custom commands can be defined in `cypress/support/commands.js` (see also https://docs.cypress.io/api/cypress-api/custom-commands.html).

#### `cy.login()`
There is a full test for making sure the login using the UI is working (`cypress/integration/Auth/login.spec`), therefore please use the global `cy.login()` method in all other tests within the `beforeEach` hook. It's bypassing the UI and is therefore much faster. 

## Documentation and tutorials
[Documentation](https://docs.cypress.io/guides/overview/why-cypress.html#In-a-nutshell).

By checking this link, you can find video guide how to [write your first test](https://docs.cypress.io/guides/getting-started/writing-your-first-test.html#Add-a-test-file).

Documentation on [integrating Cypress into your IDE](https://docs.cypress.io/guides/tooling/IDE-integration.html) (signature help when writing or hovering over commands, autocomplete while typing commands or assertion chains)
