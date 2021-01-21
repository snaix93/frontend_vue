import ruleData from '@/mixins/ruleData';
import { mapActions } from 'vuex';

export default {
  mixins: [ruleData],
  data: () => ({
    customCheckRegisteredWatchers: [],
  }),
  computed: {
    expressionAliases() {
      return {
        failedStack: [
          {
            display: this.$t('rule.expressionAliases.hasFailedForTheFirstTime'),
            value: 'failed_1_times',
          },
          {
            display: this.$t('rule.expressionAliases.hasFailed2TimesConsecutively'),
            value: 'failed_2_times',
          },
          {
            display: this.$t('rule.expressionAliases.hasFailed3TimesConsecutively'),
            value: 'failed_3_times',
          },
          {
            display: this.$t('rule.expressionAliases.hasFailed5TimesConsecutively'),
            value: 'failed_5_times',
          },
          {
            display: this.$t('rule.expressionAliases.hasFailed8TimesConsecutively'),
            value: 'failed_8_times',
          },
        ],
      };
    },
    customCheckConditions() {
      return {
        runningProcesses: {
          setup: {
            init: (init) => {
              init.setup.defaults();
              init.setup.watchers();
            },
            defaults: () => {
              this.Rule.operator = '=';
              this.Rule.function = 'last';
              this.Rule.threshold = 0;
              this.Rule.resultsRange = 1;
              this.Rule.keyFunction.value = '';
            },
            watchers: () => {
              this.customCheckRegisteredWatchers.push(this.$watch('Rule.checkKey', () => {
                this.customCheckConditions.runningProcesses.fields.keyFunctionValue.items = [];

                // this is a horrible hacky way of making this work, but it works...
                // changing the data triggers the watcher to run to hydrate the dropdown
                // with the correct data.
                this.customCheckConditions.runningProcesses.fields.keyFunctionValue.autocompleteSearch = '1';
                this.customCheckConditions.runningProcesses.fields.keyFunctionValue.autocompleteSearch = '';
              }));
              this.customCheckRegisteredWatchers.push(this.$watch(
                'customCheckConditions.runningProcesses.fields.keyFunctionValue.autocompleteSearch',
                async () => {
                  if (!! this.customCheckConditions.runningProcesses.fields.keyFunctionValue.items.length
                      || this.checkKeyWatcherFetchInProgress) {
                    return;
                  }

                  this.$wait.start('rule:fetch-processes');
                  this.checkKeyWatcherFetchInProgress = true;
                  const type = this.Rule.checkKey.includes('@Name') ? 'process' : 'cmdline';
                  let data = this.$store.getters['rules/getProcesses'](type);
                  if (! data) {
                    data = await this.$store.dispatch('rules/fetchProcesses', { type });
                  }

                  this.customCheckConditions.runningProcesses.fields.keyFunctionValue.items =
                    data.sort().map((item) => ({ text: item, value: item }));

                  this.$wait.end('rule:fetch-processes');
                  this.checkKeyWatcherFetchInProgress = false;
                }),
              );
            },
            validation: () => ({
              keyFunctionValue: {
                required: true,
                min: 3,
              },
            }),
            preSubmit: () => {
              this.Rule.keyFunction.key = 'find';
            },
          },
          fields: {
            keyFunctionValue: {
              colSize: 'xs4',
              type: 'v-combobox',
              items: [],
              autocompleteSearch: '',
              model: {
                get: () => this.Rule.keyFunction.value,
                set: (value) => {
                  this.Rule.keyFunction.value = value;
                },
              },
              hint: `${this.$t('rule.useWildcard')} | ${this.$t('rule.caseSensitive')}`,
              label: this.$t('form.field.enterMatchingProcess'),
            },
            has: {
              colSize: 'shrink',
              type: 'text',
              value: 'has',
            },
            operator: {
              colSize: 'xs2',
              type: 'v-select',
              items: this.operators,
              model: {
                get: () => this.Rule.operator,
                set: (value) => {
                  this.Rule.operator = value;
                },
              },
              label: this.$t('form.field.operator'),
            },
            threshold: {
              colSize: 'xs3',
              type: 'v-text-field',
              model: {
                get: () => this.Rule.threshold,
                set: (value) => {
                  this.Rule.threshold = value;
                },
              },
              label: '# of running processes',
            },
            times: {
              colSize: 'shrink',
              type: 'text',
              value: 'processes running.',
            },
          },
          display: {
            text: `${this.$t('phrase.has')} {operator} {numOfProcesses} ${this.$t(
              'phrase.running',
            )} {runningProcesses}`,
            key: {
              process: 'keyFunction.value',
              operator: 'operator',
              numOfProcesses: 'threshold',
              runningProcesses: ({ threshold: t }) => this.$tc('phrase.process', t),
            },
          },
        },
        serviceState: {
          setup: {
            init: (init) => {
              init.setup.defaults();
            },
            defaults: () => {
              this.Rule.function = 'last';
              this.Rule.threshold = 0;
              this.Rule.resultsRange = 1;
              this.Rule.operator = '<>';
              this.Rule.keyFunction.value = '';
              this.Rule.keyFunction.key = 'running';
            },
            validation: () => ({
              keyFunctionValue: {
                required: true,
                min: 3,
              },
              keyFunctionKey: {
                required: true,
              },
            }),
          },
          fields: {
            keyFunctionValue: {
              colSize: 'xs4',
              type: 'v-text-field',
              model: {
                get: () => this.Rule.keyFunction.value,
                set: (value) => {
                  this.Rule.keyFunction.value = value;
                },
              },
              hint: this.$t('rule.caseSensitive'),
              label: this.$t('form.field.enterMatchingService'),
            },
            operator: {
              colSize: 'xs4',
              type: 'v-select',
              items: this.operatorsIsAndIsNot,
              model: {
                get: () => this.Rule.operator,
                set: (value) => {
                  this.Rule.operator = value;
                },
              },
              label: this.$t('form.field.operator'),
            },
            keyFunctionKey: {
              colSize: 'xs4',
              type: 'v-select',
              items: this.serviceStates,
              model: {
                get: () => this.Rule.keyFunction.key,
                set: (value) => {
                  this.Rule.keyFunction.key = value;
                },
              },
              label: this.$t('form.field.enterMatchingService'),
            },
          },
          display: {
            text: `${this.$t('phrase.service')} "{service}" {operator} "{state}"`,
            key: {
              service: 'keyFunction.value',
              operator: ({ operator }) => (operator === '=' ? this.$t('phrase.is') : this.$t(
                'phrase.isNot',
              )),
              state: 'keyFunction.key',
            },
          },
        },
      };
    },
    checkKeysByCheckType() {
      return {
        any: [
          {
            display: '',
            value: '*.success',
            expressionAliases: this.expressionAliases.failedStack,
          },
        ],
        cagent: [
          {
            display: this.$t('rule.checkKeys.FileSystemFreePercent'),
            value: 'fs.free_percent.*',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.CPUUtilizationIdlePercent'),
            value: 'cpu.util.idle.*.total',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.CPUUtilizationSystemPercent'),
            value: 'cpu.util.system.*.total',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.CPUUtilizationUserPercent'),
            value: 'cpu.util.user.*.total',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.CPUUtilizationIowaitPercent'),
            value: 'cpu.util.iowait.*.total',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.MemAvailablePercent'),
            value: 'mem.available_percent',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.MemCachedPercent'),
            value: 'mem.cached_percent',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.MemFreePercent'),
            value: 'mem.free_percent',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.MemSharedPercent'),
            value: 'mem.shared_percent',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.MemUsedPercent'),
            value: 'mem.used_percent',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.TempThresholdPercent'),
            value: 'temperatures.list.percent',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.NumOfRunningProcessesName'),
            value: 'proc.list@Name',
            tooltipKey: 'RULE_NUM_RUNNING_PROCESSES',
            customCheckCondition: this.customCheckConditions.runningProcesses,
          },
          {
            display: this.$t('rule.checkKeys.NumOfRunningProcessesCmdline'),
            value: 'proc.list@Cmdline',
            tooltipKey: 'RULE_NUM_RUNNING_PROCESSES',
            customCheckCondition: this.customCheckConditions.runningProcesses,
          },
          {
            display: this.$t('rule.checkKeys.serviceState'),
            value: 'services.list@name',
            customCheckCondition: this.customCheckConditions.serviceState,
          },
          {
            display: this.$t('rule.checkKeys.orManuallySpecifyCheckKey'),
            // This is a special key which allows the user to manually
            // specify the checkKey.
            value: this.customCheckKeyPlaceholder,
            expression: true,
          },
        ],
        serviceCheck: [
          {
            display: this.$t('rule.checkKeys.ICMPPingSuccess'),
            value: 'net.icmp.ping.success',
            expressionAliases: this.expressionAliases.failedStack,
          },
          {
            display: this.$t('rule.checkKeys.ICMPPingPacketLoss'),
            value: 'net.icmp.ping.packet_loss',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.ICMPPingPacketLossPercent'),
            value: 'net.icmp.ping.packetLoss_percent',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.ICMPPingRoundTripTime'),
            value: 'net.icmp.ping.round_trip_time_s',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.TCPServiceCheckSuccess'),
            value: 'net.tcp.*.success',
            expression: true,
          },
          {
            display: this.$t('rule.checkKeys.TCPServicePerformance'),
            value: 'net.tcp.*.perf_s',
            expression: true,
          },
        ],
        webCheck: [
          {
            display: this.$t('rule.checkKeys.WebcheckAnySuccess'),
            value: 'http.*.success',
            expressionAliases: this.expressionAliases.failedStack,
          },
          {
            display: this.$t('rule.checkKeys.WebcheckGetSuccess'),
            value: 'http.get.success',
            expressionAliases: this.expressionAliases.failedStack,
          },
          {
            display: this.$t('rule.checkKeys.WebcheckPostSuccess'),
            value: 'http.post.success',
            expressionAliases: this.expressionAliases.failedStack,
          },
          {
            display: this.$t('rule.checkKeys.WebcheckHeadSuccess'),
            value: 'http.head.success',
            expressionAliases: this.expressionAliases.failedStack,
          },
          {
            display: this.$t('rule.checkKeys.WebCheckAnyPerformance'),
            value: 'http.*.performance_s',
            expression: true,
          },
        ],
        customCheck: [
          {
            display: this.$options.filters.capitalize(this.$t('rule.checkKeys.any')),
            value: '*.success',
            expressionAliases: this.expressionAliases.failedStack,
          },
          {
            display: this.$t('rule.checkKeys.orManuallySpecifyCheckKey'),
            // This is a special key which allows the user to manually
            // specify the checkKey.
            value: this.customCheckKeyPlaceholder,
            expression: true,
          },
        ],
        snmpCheck: [
          {
            display: this.$t('rule.checkKeys.SNMPIfOutBPS'),
            value: 'snmp@ifOut_Bps',
            expression: true,
            active: this.$config.environment !== 'PROD',
            reason: 'Coming soon',
          },
          {
            display: this.$t('rule.checkKeys.SNMPIfInMBPS'),
            value: 'snmp@ifIn_Bps',
            expression: true,
            active: this.$config.environment !== 'PROD',
            reason: 'Coming soon',
          },
          {
            display: this.$t('rule.checkKeys.SNMPIfOutUtilizationPercent'),
            value: 'snmp@ifOutUtilization_percent',
            expression: true,
            active: this.$config.environment !== 'PROD',
            reason: 'Coming soon',
          },
          {
            display: this.$t('rule.checkKeys.SNMPIfInUtilizationPercent'),
            value: 'snmp@ifInUtilization_percent',
            expression: true,
            active: this.$config.environment !== 'PROD',
            reason: 'Coming soon',
          },
        ],
      };
    },
    ruleDisplay() {
      return {
        host: {
          none: {
            icon: 'all_inclusive',
            label: this.$t('rule.hostMatchPartPhrases.is'),
            color: 'grey',
          },
          uuid: {
            icon: 'storage',
            label: this.$t('rule.hostMatchPartPhrases.is'),
            color: 'grey',
          },
          name: {
            icon: 'format_quote',
            label: this.$t('rule.hostMatchPartPhrases.nameMatches'),
            color: 'grey',
          },
          connect: {
            icon: 'format_quote',
            label: this.$t('rule.hostMatchPartPhrases.connectMatches'),
            color: 'grey',
          },
          tag: {
            icon: 'format_quote',
            label: this.$t('rule.hostMatchPartPhrases.hasATagThatMatches'),
            color: 'grey',
          },
        },
        action: {
          alert: {
            icon: 'notifications_active',
            label: this.$tc('rule.actions.alert', 1),
            prependCheckKey: this.$tc('rule.actions.alert', 2),
            color: 'error',
          },
          warning: {
            icon: 'notifications_active',
            label: this.$tc('rule.actions.warning', 1),
            color: 'warning',
          },
          warn: {
            icon: 'notifications_active',
            label: this.$tc('rule.actions.warning', 1),
            prependCheckKey: this.$tc('rule.actions.warning', 2),
            color: 'warning',
          },
          ignore: {
            icon: 'notifications_off',
            label: this.$t('rule.actions.ignore'),
            color: 'grey',
          },
        },
        exit: {
          false: {
            icon: 'play_arrow',
            label: this.$t('phrase.continue'),
            color: 'success',
          },
          true: {
            icon: 'eject',
            label: this.$t('phrase.exit'),
            color: 'error',
          },
        },
        checkType: {
          any: {
            icon: 'all_inclusive',
            label: this.$tc('rule.checkTypes.any', 2),
            labelShort: this.$tc('rule.checkTypes.any', 1),
            color: 'grey',
          },
          serviceCheckWebCheck: {
            icon: 'all_inclusive',
            label: this.$tc('rule.checkTypes.webAndService', 2),
            labelShort: this.$tc('rule.checkTypes.webAndService', 1),
            color: 'grey',
          },
          serviceCheck: {
            icon: 'dns',
            label: this.$tc('rule.checkTypes.serviceCheck', 2),
            labelShort: this.$tc('rule.checkTypes.serviceCheck', 1),
            color: 'grey',
          },
          webCheck: {
            icon: 'web',
            label: this.$tc('rule.checkTypes.webCheck', 2),
            labelShort: this.$tc('rule.checkTypes.webCheck', 1),
            color: 'grey',
          },
          cagent: {
            icon: 'cast',
            label: this.$tc('rule.checkTypes.cagent', 2),
            labelShort: this.$tc('rule.checkTypes.cagent', 1),
            color: 'grey',
          },
          customCheck: {
            icon: 'build',
            label: this.$tc('rule.checkTypes.customCheck', 2),
            labelShort: this.$tc('rule.checkTypes.customCheck', 1),
            color: 'grey',
          },
          snmpCheck: {
            icon: 'all_out',
            label: this.$tc('rule.checkTypes.snmpCheck', 2),
            labelShort: this.$tc('rule.checkTypes.snmpCheck', 1),
            color: 'grey',
          },
        },
        checkKey: {
          default: {
            icon: 'track_changes',
            color: 'grey',
          },
          any: {
            label: this.$t('rule.checkKeys.any'),
          },
          '*.success': {
            label: this.$t('rule.checkKeys.any'),
          },
          'net.icmp.ping.success': {
            label: this.$t('rule.checkKeys.ICMPPingSuccess'),
          },
          'net.icmp.ping.packet_loss': {
            label: this.$t('rule.checkKeys.ICMPPingPacketLoss'),
          },
          'net.icmp.ping.packetLoss_percent': {
            label: this.$t('rule.checkKeys.ICMPPingPacketLossPercent'),
          },
          'net.icmp.ping.round_trip_time_s': {
            label: this.$t('rule.checkKeys.ICMPPingRoundTripTime'),
          },
          'net.tcp.*.success': {
            label: this.$t('rule.checkKeys.TCPServiceCheckSuccess'),
          },
          'net.tcp.*.perf_s': {
            label: this.$t('rule.checkKeys.TCPServicePerformance'),
          },
          'http.*.success': {
            label: this.$t('rule.checkKeys.WebcheckAnySuccess'),
          },
          'http.get.success': {
            label: this.$t('rule.checkKeys.WebcheckGetSuccess'),
          },
          'http.post.success': {
            label: this.$t('rule.checkKeys.WebcheckPostSuccess'),
          },
          'http.head.success': {
            label: this.$t('rule.checkKeys.WebcheckHeadSuccess'),
          },
          'http.*.performance_s': {
            label: this.$t('rule.checkKeys.WebCheckAnyPerformance'),
          },
          'fs.free_percent.*': {
            label: this.$t('rule.checkKeys.FileSystemFreePercent'),
          },
          'cpu.util.idle.*.total': {
            label: this.$t('rule.checkKeys.CPUUtilizationIdlePercent'),
          },
          'cpu.util.system.*.total': {
            label: this.$t('rule.checkKeys.CPUUtilizationSystemPercent'),
          },
          'cpu.util.user.*.total': {
            label: this.$t('rule.checkKeys.CPUUtilizationUserPercent'),
          },
          'cpu.util.iowait.*.total': {
            label: this.$t('rule.checkKeys.CPUUtilizationIowaitPercent'),
          },
          'mem.available_percent': {
            label: this.$t('rule.checkKeys.MemAvailablePercent'),
          },
          'mem.cached_percent': {
            label: this.$t('rule.checkKeys.MemCachedPercent'),
          },
          'mem.free_percent': {
            label: this.$t('rule.checkKeys.MemFreePercent'),
          },
          'mem.shared_percent': {
            label: this.$t('rule.checkKeys.MemSharedPercent'),
          },
          'mem.used_percent': {
            label: this.$t('rule.checkKeys.MemUsedPercent'),
          },
          'temperatures.list.percent': {
            label: this.$t('rule.checkKeys.TempThresholdPercent'),
          },
          'proc.list@Name': {
            label: this.$t('rule.checkKeys.NumOfRunningProcessesName'),
          },
          'proc.list@Cmdline': {
            label: this.$t('rule.checkKeys.NumOfRunningProcessesCmdline'),
          },
          'services.list@name': {
            label: this.$t('rule.checkKeys.serviceState'),
          },
          'snmp@ifOut_Bps': {
            label: this.$t('rule.checkKeys.SNMPIfOutBPS'),
          },
          'snmp@ifIn_Bps': {
            label: this.$t('rule.checkKeys.SNMPIfInMBPS'),
          },
          'snmp@ifOutUtilization_percent': {
            label: this.$t('rule.checkKeys.SNMPIfOutUtilizationPercent'),
          },
          'snmp@ifInUtilization_percent': {
            label: this.$t('rule.checkKeys.SNMPIfInUtilizationPercent'),
          },
          '*warning': {
            label: this.$t('rule.checkKeys.containsAWarning'),
          },
          '*alert': {
            label: this.$t('rule.checkKeys.containsAnAlert'),
          },
          'modules': {
            label: this.$t('rule.checkKeys.modules'),
            prependSeverity: true,
          },
        },
        expressionAlias: {
          default: {
            icon: 'timer',
            color: 'error',
          },
          failed_1_times: {
            label: this.$t('rule.expressionAliases.hasFailedForTheFirstTime'),
          },
          failed_2_times: {
            label: this.$t('rule.expressionAliases.hasFailed2TimesConsecutively'),
          },
          failed_3_times: {
            label: this.$t('rule.expressionAliases.hasFailed3TimesConsecutively'),
          },
          failed_5_times: {
            label: this.$t('rule.expressionAliases.hasFailed5TimesConsecutively'),
          },
          failed_8_times: {
            label: this.$t('rule.expressionAliases.hasFailed8TimesConsecutively'),
          },
        },
        expressionOperator: {
          empty: {
            label: this.$tc('rule.operators.empty'),
            threshold: false,
          },
          notEmpty: {
            label: this.$tc('rule.operators.notEmpty'),
            threshold: false,
          },
        },
        expression: {
          default: {
            icon: 'timer',
            color: 'error',
          },
        },
      };
    },
  },
  methods: {
    ...mapActions('rules', {
      _nonAssignmentUpdate: 'nonAssignmentUpdate'
    }),
    async rule_toggleRuleActiveState(Rule) {
      await this._nonAssignmentUpdate({ Rule });
      this.$flash.success(this.$t('message.success.ruleSaved', { rule: Rule.id }));
    },
  }
};
