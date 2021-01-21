describe('Rules', function () {
  const rule = Cypress.env('DEFAULT_RULE_HOST_MATCH')
  const apiPath = `${Cypress.env('API_PATH')}/rules`

  const HOST_MATCH_TEXT_CRITERIA_FORM_GROUP = 'hostMatchTextCriteriaFormGroup';
  const HOST_MATCH_TAG_CRITERIA_FORM_GROUP = 'hostMatchTagCriteriaFormGroup';
  const HOST_MATCH_UUID_CRITERIA_FORM_GROUP = 'hostMatchUuidCriteriaFormGroup';

  const CHECK_KEY_FORM_GROUP = 'checkKeyFormGroup';
  const CUSTOM_CHECK_KEY_FORM_GROUP = 'customCheckKeyFormGroup'

  context('Rules Page', function () {
    beforeEach(function () {
      cy.server()

      cy.login()

      cy.visit('/rules')

      cy.route(apiPath).as('getRules')
      cy.route('POST', apiPath).as('postRule')
      cy.route('PUT', `${Cypress.env('API_PATH')}/rules/*`).as('putRule')
      cy.route('DELETE', `${apiPath}/*`).as('deleteRule')

      cy.wait('@getRules')

      cy.get('[data-cy=rulesList]')
        .as('rulesList')

      cy.get('[data-cy=createButton]')
        .as('addRuleButton')
    })

    it('displays a button containing "add rule"', () => {
      cy.get('@addRuleButton')
        .contains(/add rule/i)
    })

    it('displays errors on submitting empty required fields', () => {
      cy.get('@addRuleButton')
        .click()

      cy.wait(500)

      cy.get('[data-cy=hostMatchPartSelectFormGroup]')
        .find('.v-select')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('.v-list__tile')
        .contains('Name')
        .click()

      cy.get(`[data-cy=${HOST_MATCH_TEXT_CRITERIA_FORM_GROUP}]`)
        .as('hostMatchTextCriteriaFormGroup')

      cy.get('[data-cy=ruleForm]:visible')
        .submit()

      cy.get('@hostMatchTextCriteriaFormGroup')
        .contains(/The host match criteria field is required/i)

      cy.get('[data-cy=selectCheckTypeFormGroup]')
        .contains(/The check type field is required/i)
    })

    it('displays the correct fields based on the forms configuration', () => {
      const hostMatchOptions = [
        {
          selector: /is any/i,
          hostMatchPart: false,
        },
        {
          selector: /^is$/i,
          hostMatchPart: HOST_MATCH_UUID_CRITERIA_FORM_GROUP,
        },
        {
          selector: /name/i,
          hostMatchPart: HOST_MATCH_TEXT_CRITERIA_FORM_GROUP,
        },
        {
          selector: /FQDN\/IP/i,
          hostMatchPart: HOST_MATCH_TEXT_CRITERIA_FORM_GROUP,
        },
        {
          selector: /has a tag/i,
          hostMatchPart: HOST_MATCH_TAG_CRITERIA_FORM_GROUP,
        }
      ];

      cy.get('@addRuleButton')
        .click()

      cy.wait(500)

      cy.log('Testing host match options')

      const selectHostMatchOption = (selector) => {
        cy.get('[data-cy=hostMatchPartSelectFormGroup]')
          .find('.v-select')
          .click()

        cy.get('.v-menu__content.menuable__content__active')
          .contains(selector)
          .click()
      }

      for(let hostMatchOption of hostMatchOptions) {
        selectHostMatchOption(hostMatchOption.selector);

        if(!!hostMatchOption.hostMatchPart) {
          cy.get(`[data-cy=${hostMatchOption.hostMatchPart}]`)
        } else {
          cy.get(`[data-cy=${HOST_MATCH_TEXT_CRITERIA_FORM_GROUP}]`)
            .should('not.exist')
          cy.get(`[data-cy=${HOST_MATCH_TAG_CRITERIA_FORM_GROUP}]`)
            .should('not.exist')
          cy.get(`[data-cy=${HOST_MATCH_UUID_CRITERIA_FORM_GROUP}]`)
            .should('not.exist')
        }
      }

      cy.log('Testing check type options')

      cy.get('[data-cy=selectCheckTypeFormGroup]')
        .find('.v-select')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .contains(/custom check/i)
        .click()

      cy.get(`[data-cy=${CHECK_KEY_FORM_GROUP}]`)
        .find('.v-select')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .contains(/or manually specify check key\:/i)
        .click()

      cy.get(`[data-cy=${CUSTOM_CHECK_KEY_FORM_GROUP}]`)

      cy.get('[data-cy=selectCheckTypeFormGroup]')
        .find('.v-select')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .contains(/website & service check/i)
        .click()

      cy.get(`[data-cy=${CHECK_KEY_FORM_GROUP}]`)
        .should('not.exist')

      cy.get(`[data-cy=${CUSTOM_CHECK_KEY_FORM_GROUP}]`)
        .should('not.exist')
    })

    it('successfully creates a rule', () => {
      // Check if host already exists and delete it if needed
      cy.log('Delete default rule if it already exists')
      cy.deleteRule(rule)

      // Reload page and wait for getRules request
      cy.visit('/rules')
      cy.wait('@getRules')

      // Create rule
      cy.log('Create rule')

      cy.get('@addRuleButton')
        .click()

      cy.wait(500)

      cy.get('[data-cy=hostMatchPartSelectFormGroup]')
        .find('.v-select')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('.v-list__tile')
        .contains('Name')
        .click()

      cy.get(`[data-cy=${HOST_MATCH_TEXT_CRITERIA_FORM_GROUP}]`)
        .as('hostMatchTextCriteriaFormGroup')

      cy.get('@hostMatchTextCriteriaFormGroup')
        .find('input')
        .type(rule)

      cy.get('[data-cy=selectCheckTypeFormGroup]')
        .find('.v-select')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('.v-list__tile')
        .contains(/Website \& service check/i)
        .click()

      cy.get('[data-cy=ruleForm]:visible')
        .submit()

      cy.wait('@postRule')

      cy.get('@rulesList')
        .contains(new RegExp(rule, 'i'))
    })

    it('successfully edits and deletes a rule', () => {
      cy.get('@rulesList')
        .contains(new RegExp(rule, 'i'))
        .parents('tr')
        .as('tableRowWithRule')

      // Edit rule
      cy.log(`Deactive and activate rule`)

      cy.get('@tableRowWithRule')
        .find('.v-input[data-cy=ruleActiveToggle]')
        .as('ruleActiveToggle')

      cy.get('@ruleActiveToggle')
        .find('input')
        .should('have.attr', 'aria-checked', 'true')

      cy.get('@ruleActiveToggle')
        .find('.v-input--selection-controls__input')
        .click()

      cy.get('@ruleActiveToggle')
        .find('input')
        .should('have.attr', 'aria-checked', 'false')

      cy.log(`Change rule's name`)

      cy.get('@tableRowWithRule')
        .find('[data-cy=ruleActionsButton]').as('ruleActionsButton')

      cy.get('@ruleActionsButton')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('[data-cy=editRuleButton]')
        .click()

      cy.get(`[data-cy=${HOST_MATCH_TEXT_CRITERIA_FORM_GROUP}]`)
        .find('input')
        .type(': name changed')

      cy.get('[data-cy=ruleForm]:visible')
        .submit()

      cy.wait('@putRule')

      cy.get('@tableRowWithRule')
        .contains(new RegExp(`${rule}: name changed`, 'i'))

      // Delete rule
      cy.log('Delete rule')

      cy.get('@ruleActionsButton')
        .click()

      cy.get('.v-menu__content.menuable__content__active')
        .find('[data-cy=deleteRuleButton]')
        .click()

      cy.get('[data-cy=dialogConfirmButton]:visible')
        .click()

      cy.wait('@deleteRule')

      cy.get('@rulesList')
        .contains(new RegExp(rule, 'i'))
        .should('not.exist')
    })
  })
})
