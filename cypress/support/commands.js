import 'cypress-file-upload';

const isMethod = param => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(param);

Cypress.Commands.add('getByData', key => cy.get(`[data-qa="${key}"]`));

Cypress.Commands.add('login', function(_username, _password) {
  // as we have a full-blown e2e test for the login already
  // there is NO more reason to actually use the UI to log in users
  //
  // with cy.request we can bypass this because it automatically gets
  // and sets cookies under the hood. This acts exactly as if the requests
  // came from the browser.

  const loginData = {
    email: _username ? _username : Cypress.env('DEFAULT_USER'),
    password: _password ? _password : Cypress.env('DEFAULT_USER_PWD'),
  };

  // login URL
  const loginURL = `${this.apiUrl}/auth/login`;

  Cypress.log({
    name: 'login',
    message: `${loginData.email} | ${loginData.password}`,
  });

  cy.request('POST', loginURL, loginData)
    .its('body.token')
    .as('accessToken')
    .then((token) => {
      localStorage.setItem('auth._token.laravelJWT', `Bearer ${token}`);
      localStorage.setItem('auth.strategy', 'laravelJWT');
      localStorage.setItem('auth._refresh_token.laravelJWT', true);
    });
});

Cypress.Commands.add('authedRequest', function (param1, param2, param3) {
  let options;
  // if first param is options....
  if (Cypress._.isObject(param1)) {
    // cy.request(options)
    options = param1;
  } else if (! isMethod(param1)) {
    // cy.request(url)
    // cy.request(url, body)
    options = {
      method: 'GET',
      url: param1,
      body: param2,
    };
  } else {
    // cy.request(method, url)
    // cy.request(method, url, body)
    options = {
      method: param1,
      url: param2,
      body: param3,
    };
  }
  options.url = `${Cypress.env('API_PATH')}${options.url}`;
  return cy.get('@accessToken').then(token => cy.request({
    ...options,
    auth: {
      bearer: token,
    },
  }));
});

/**
 * Adds apiUrl in front of passed url and forwards to cy.route.
 *
 * Honours wrapped command signature:
 *
 * cy.route(url)
 * cy.route(url, response)
 * cy.route(method, url)
 * cy.route(method, url, response)
 * cy.route(callbackFn)
 * cy.route(options)
 */
Cypress.Commands.add('apiRoute', function (param1, param2 = false, param3 = false) {
  if (typeof param1 === 'function') {
    throw Error('Use `cy.route` command instead of the `cy.apiRoute` custom command for passing a callback arg.');
  }

  let options;
  // if first param is options....
  if (Cypress._.isObject(param1)) {
    // cy.route(options)
    options = param1;
  } else if (! isMethod(param1)) {
    // cy.route(url)
    // cy.route(url, response)
    options = {
      method: 'GET',
      url: param1
    };
    if (param2) {
      options.response = param2;
    }
  } else {
    // cy.route(method, url)
    // cy.route(method, url, response)
    options = {
      method: param1,
      url: param2
    };
    if (param3) {
      options.response = param3;
    }
  }

  if (options.url.indexOf('/') !== 0) {
    options.url = `/${options.url}`;
  }

  options.url = `${this.apiUrl}${options.url}`;

  return cy.route(options);
});

Cypress.Commands.add('createHost', function(_name, _connect) {
  const name = _name ? _name : Cypress.env('DEFAULT_HOST');
  const connect = _connect ? _connect : Cypress.env('DEFAULT_HOST');
  const tags = [Cypress.env('DEFAULT_TAG')];

  function hostObj(_name, _connect, _tags, _subUnitId) {
    return {
      name: _name,
      connect: _connect,
      tags: _tags,
      subUnitId: _subUnitId,
    };
  }

  cy.deleteHost(Cypress.env('DEFAULT_HOST'));

  cy.authedRequest('GET', '/sub-units')
    .its('body.data')
    .then((data) => {
      const defaultSubUnit = data.find(subUnit => subUnit.shortId === Cypress.env('DEFAULT_CUSTOMER'));

      // if default customer sub-unit exists, add it to host object
      if (defaultSubUnit) {
        cy.log('Create default host with sub-unit');
        cy.authedRequest('POST', `/hosts`, hostObj(name, connect, tags, defaultSubUnit.id))
          .then((response) => {
            expect(response.status).to.eq(201);
          });
      } else {
        cy.log('Create default host without sub-unit');
        cy.authedRequest('POST', `/hosts`, hostObj(name, connect, tags))
          .then((response) => {
            expect(response.status).to.eq(201);
          });
      }
    });
});

Cypress.Commands.add('deleteHost', function(_host) {
  cy.log(`Check if ${_host} exists and delete it`);
  cy.authedRequest('GET', '/hosts')
    .its('body.data')
    .then((data) => {
      const host = data.find(host => host.name === _host);

      if (host) {
        cy.log('Delete existing default host');

        cy.authedRequest('DELETE', `/hosts/${host.id}?complete=true`)
          .then((response) => {
            expect(response.status).to.eq(204);
          });
      }
    });
});

Cypress.Commands.add('createSubUnit', function() {
  const subUnit = Cypress.env('DEFAULT_CUSTOMER');

  cy.deleteSubUnit(subUnit);

  cy.log('Create default sub-unit');
  cy.authedRequest('POST', '/sub-units', {
    shortId: subUnit,
    name: subUnit,
    information: ''
  }).then((response) => {
    expect(response.status).to.eq(201);
  });
});

Cypress.Commands.add('deleteSubUnit', function(_shortId) {
  cy.log(`Check if sub-unit with shortId "${_shortId}" exists and delete it`);
  cy.authedRequest('GET', '/sub-units')
    .its('body.data')
    .then((data) => {
      const subUnit = data.find(subUnit => subUnit.shortId === _shortId);
      if (subUnit) {
        cy.authedRequest('DELETE', `/sub-units/${subUnit.id}`)
          .then((response) => {
            expect(response.status).to.eq(204);
          });
      }
    });
});

Cypress.Commands.add('deleteRule', function(_rule) {
  cy.log(`Check if ${_rule} exists and delete it`);
  cy.authedRequest('GET', '/rules')
    .its('body.data')
    .then((data) => {
      const rule = data.find(rule => rule.hostMatchCriteria === _rule);

      if (rule) {
        cy.log('Delete existing default rule');
        cy.authedRequest('DELETE', `/rules/${rule.id}`)
          .then((response) => {
            expect(response.status).to.eq(204);
          });
      }
    });
});
