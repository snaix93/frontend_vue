import Model from './Model';

export default class Rule extends Model {
  static className = 'Rule';
  static filters = {
    ...this.defaultFilters,
  };
  static attributes = {
    hostMatchPart: 'none',
    hostMatchCriteria: 'any',
    keyFunction: null,
    active: true,
    finish: false,
    action: 'alert',
  };

  static customRuleAttributes = {
    ...Rule.attributes,
    expressionAlias: 'failed_1_times',
    checkType: [],
    checkKey: '*.success',
    keyFunction: { key: '', value: '' },
    function: 'sum',
    resultsRange: 4,
    operator: '<',
    threshold: 1.001,
  };

  static wizardBaseRules = {
    customKeyRule: {
      checkKey: '',
      checkType: [], // filled in component
      expressionAlias: null,
      function: 'avg',
      resultsRange: 5,
      operator: '=',
      threshold: 1,
    },
    snmpRule: {
      checkKey: '',
      checkType: [], // filled in component
      expressionAlias: null,
      function: 'avg',
      resultsRange: 5,
      operator: '=',
      threshold: 1,
    },
    processRule: {
      checkKey: 'proc.list@Name',
      checkType: ['cagent'],
      expressionAlias: null,
      function: 'last',
      keyFunction: { key: 'find', value: '' },
      operator: '=',
      resultsRange: 1,
      threshold: '0',
    },
    serviceRule: {
      checkKey: 'services.list@name',
      checkType: ['cagent'],
      expressionAlias: null,
      function: 'last',
      keyFunction: { key: 'running', value: '' },
      operator: '<>',
      resultsRange: 1,
      threshold: '0',
    },
  };

  save() {
    if (!! this?.keyFunction && typeof this.keyFunction === 'object') {
      this.keyFunction = JSON.stringify(this.keyFunction);
    }

    return super.save();
  }
}
