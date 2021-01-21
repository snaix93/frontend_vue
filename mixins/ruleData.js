export default {
  data() {
    return {
      // REGEXP: From beginning of string, must match exactly 2 lowercase
      // letters. Then will match zero or more 'any-characters' except
      // whitespace chars, up until a literal period. Then after the
      // period will match zero or more 'any-characters' expect
      // whitespace chars up to the end of the string.
      customCheckKeyRegExp: '^[a-z]{2}[\\S.]*\\.[\\S.]*$',
      customCheckKeyPlaceholder: '[CUSTOM]',
      actions: [
        { display: this.$t('rule.actions.sendAnAlert'), value: 'alert' },
        { display: this.$t('rule.actions.sendAWarning'), value: 'warn' },
        { display: this.$t('rule.actions.nothing'), value: 'ignore' },
      ],
      functions: [
        { label: this.$t('rule.functions.sum'), value: 'sum' },
        { label: this.$t('rule.functions.min'), value: 'min' },
        { label: this.$t('rule.functions.max'), value: 'max' },
        { label: this.$t('rule.functions.avg'), value: 'avg' },
        { label: this.$t('rule.functions.last'), value: 'last' },
      ],
      resultsRanges: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
        { label: '5', value: 5 },
      ],
      operators: [
        { text: this.$tc('rule.operators.greaterThan'), value: '>', threshold: true },
        { text: this.$tc('rule.operators.lessThan'), value: '<', threshold: true },
        { text: this.$tc('rule.operators.equalTo'), value: '=', threshold: true },
        { text: this.$tc('rule.operators.notEqualTo'), value: '<>', threshold: true },
        { text: this.$tc('rule.operators.empty'), value: 'empty', threshold: false },
        {
          text: this.$tc('rule.operators.notEmpty'),
          value: 'notEmpty',
          threshold: false,
          tooltip: this.$tc('rule.tooltips.notEmpty')
        },
      ],
      operatorsIsAndIsNot: [
        { text: this.$t('phrase.isNot'), value: '<>' },
        { text: this.$t('phrase.is'), value: '=' }],
      serviceStates: [
        { text: this.$t('host.serviceStates.running').toUpperCase(), value: 'running' },
        { text: this.$t('host.serviceStates.paused').toUpperCase(), value: 'paused' },
        { text: this.$t('host.serviceStates.stopped').toUpperCase(), value: 'stopped' },
        { text: this.$t('host.serviceStates.exited').toUpperCase(), value: 'exited' },
        { text: this.$t('host.serviceStates.dead').toUpperCase(), value: 'dead' },
      ],
      checkTypeOptions: [
        // {
        //   label: this.$options.filters.capitalize(this.$tc('rule.checkTypes.any', 2)),
        //   value: ['any'],
        // },
        {
          label: this.$options.filters.capitalize(this.$tc('rule.checkTypes.serviceCheck', 2)),
          value: ['serviceCheck'],
        },
        {
          label: this.$options.filters.capitalize(this.$tc('rule.checkTypes.webCheck', 2)),
          value: ['webCheck'],
        },
        {
          label: this.$options.filters.capitalize(this.$tc('rule.checkTypes.webAndService', 2)),
          value: ['serviceCheck', 'webCheck'],
        },
        {
          label: this.$options.filters.capitalize(this.$tc('rule.checkTypes.cagent', 2)),
          value: ['cagent'],
        },
        {
          label: this.$options.filters.capitalize(this.$tc('rule.checkTypes.customCheck', 2)),
          value: ['customCheck'],
        },
        // temporarily deactivate snmp check type as long as snmp rules processor is broken
        // {
        //   label: this.$options.filters.capitalize(this.$tc('rule.checkTypes.snmpCheck', 2)),
        //   value: ['snmpCheck'],
        // },
      ],
      hostMatchPartOptions: [
        {
          label: this.$options.filters.capitalize(this.$tc('rule.hostMatchPartOptions.isAny')),
          value: 'none',
        },
        {
          label: this.$options.filters.capitalize(this.$tc('rule.hostMatchPartOptions.is')),
          value: 'uuid',
        },
        {
          label: this.$options.filters.capitalize(this.$tc('rule.hostMatchPartOptions.name')),
          value: 'name',
        },
        {
          label: this.$options.filters.capitalize(this.$tc('rule.hostMatchPartOptions.connect')),
          value: 'connect',
        },
        {
          label: this.$options.filters.capitalize(this.$tc('rule.hostMatchPartOptions.hasATag')),
          value: 'tag',
        },
      ],
    };
  },
};
