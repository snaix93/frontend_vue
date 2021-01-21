import Model from '@/models/Model';
import ServiceCheck from '@/models/ServiceCheck';
import WebCheck from '@/models/WebCheck';
import CustomCheck from '@/models/CustomCheck';
import SnmpCheck from '@/models/SnmpCheck';
import Event from '@/models/Event';
import JobmonResult from '@/models/JobmonResult';
import Frontman from '@/models/Frontman';

export default class Host extends Model {
  static className = 'Host';
  static persistableFilterKey = 'host';
  static filters = {
    ...this.defaultFilters,
    subUnit: null,
  };
  static dashboardFilters = {
    ...this.filters,
    subUnit: null,
    tag: null,
    group: null,
    sortBy: 'name',
    limit: 24,
    withIssuesOnly: false,
  };
  static attributes = {
    dashboard: true,
    frontman: {
      location: '',
    },
    snmp: {
      protocol: null,
      port: 161,
      timeout: 5
    },
  };

  get settingsPath() {
    return `/hosts/${this.id}`;
  }

  get latestDataPath() {
    return `/hosts/${this.id}/latest-data`;
  }

  get hasServiceChecks() {
    return !! this.serviceCheckCount;
  }

  get serviceCheckCount() {
    return +this.checkCounts.serviceCheckCount;
  }

  get hasWebChecks() {
    return !! this.webCheckCount;
  }

  get webCheckCount() {
    return +this.checkCounts.webCheckCount;
  }

  get hasCustomChecks() {
    return !! this.customCheckCount;
  }

  get customCheckCount() {
    return +this.checkCounts.customCheckCount;
  }

  get hasSnmpChecks() {
    return !! this.snmpCheckCount;
  }

  get snmpCheckCount() {
    return +this.checkCounts.snmpCheckCount;
  }

  get totalCheckCount() {
    return +this.checkCounts.checkCountTotal;
  }

  get hasIcmpCheck() {
    return !! this.checkCounts.hasIcmpCheck;
  }

  get hasChecks() {
    return !! this.checkCounts?.checkCountTotal;
  }

  get totalMetricCount() {
    return this.summary?.metrics || 0;
  }

  get hasMonitoringAgent() {
    return !! this?.cagent;
  }

  get hasEventSummary() {
    return this?.eventSummary;
  }

  get hasSubUnit() {
    return !! this?.subUnit;
  }

  get hasSnmpData() {
    return !! this.snmp?.protocol;
  }

  get hasLastCheckedAtDate() {
    return this.lastCheckedAtDate !== null;
  }

  get hasLastAgentCheckedAtDate() {
    return this.lastAgentCheckedAtDate !== null;
  }

  get hasPendingConnection() {
    return ! this.hasLastCheckedAtDate && this.hasChecks;
  }

  get hasPendingAgentConnection() {
    return this.hasMonitoringAgent && ! this.hasLastAgentCheckedAtDate;
  }

  get hasPendingAgentOnlyConnection() {
    return this.hasPendingAgentConnection && this.totalCheckCount === 1;
  }

  get lastCheckedAtDate() {
    return this.dates.lastCheckedAt;
  }

  get lastAgentCheckedAtDate() {
    return this.dates.cagentLastUpdatedAt;
  }

  get hasCharts() {
    return this?.summary?.state === 'MONITORED' && this?.summary?.metrics > 0;
  }

  static filter({ page, limit, sortBy, search, subUnit, group, tag, withIssuesOnly }) {
    const filter = super.filter({ page, limit, sortBy, search });

    if (withIssuesOnly !== undefined) filter.where('with-issues-only', withIssuesOnly);
    if (tag !== undefined) filter.where('tag', tag);
    if (subUnit !== undefined) filter.where('sub-unit', subUnit);
    if (group !== undefined) filter.where('group', group);

    return filter;
  }

  static fetchActiveTags() {
    return this.$http.$get('/hosts/tags')
               .then(({ data }) => data);
  }

  static fetchActiveGroups() {
    return this.$http.$get('/hosts/groups')
               .then(({ data }) => data);
  }

  static fetchHostSummaryList() {
    return this.$http.$get('/hosts/summary-list')
               .then(({ data }) => data);
  }

  static validationRules(options = {}) {
    let rules = {
      name: 'required|min:2|max:256|uniqueHostName',
      connect: 'max:256',
      description: 'max:1000',
      tags: 'tags',
      snmpAuthenticationPassword: 'min:1|max:255',
      snmpCommunity: 'min:1|max:255',
      snmpPort: 'integer|min:1|max:65535',
      snmpPrivacyPassword: 'min:1|max:255',
      snmpTimeout: 'integer|min:1|max:99',
      snmpUsername: 'min:1|max:255',
    };

    if (options.connectIsRequiredField) {
      rules.connect = `required|min:2|${rules.connect}`;
    }

    if (! options.hasMonitoringAgent) {
      if (options.hostLocation_connectIsPrivate && options.accountHasFrontmen) {
        rules.frontman = 'required|frontman:private';
      } else {
        // This means we have a text field for the frontman to create inline.
        rules.frontman = 'required|min:3|max:50';
      }
    }

    if (options.hasConnect) {
      if (options.snmp) {
        rules.snmpProtocol = 'required';
        rules.snmpTimeout = `required|${rules.snmpTimeout}`;
        rules.snmpPort = `required|${rules.snmpPort}`;
      }

      if (options.snmpV2) {
        rules.snmpCommunity = `required|${rules.snmpCommunity}`;
      }

      if (options.snmpV3) {
        rules.snmpSecurityLevel = 'required';
      }

      if (options.snmpV3Auth) {
        rules.snmpAuthenticationProtocol = 'required';
        rules.snmpUsername = `required|${rules.snmpUsername}`;
        rules.snmpAuthenticationPassword = `required|${rules.snmpAuthenticationPassword}`;
      }

      if (options.snmpV3Priv) {
        rules.snmpPrivacyProtocol = 'required';
        rules.snmpPrivacyPassword = `required|${rules.snmpPrivacyPassword}`;
      }
    }


    // if connect is private then you either need a private frontman
    // or an agent.

    // if (!this.Host.hasMonitoringAgent
    //     || (
    //       this.isUpdatingHost
    //       && this.Host.hasChecks
    //       && this.hostLocation_connectIsPrivate
    //       && this.hostLocation_originalConnectIsPublic
    //     )
    // ) {
    // TODO this needs checking as there are some changes are some weirdness
    // with updating hosts with public connect and public frontman, to a private
    // connect and not changing frontman. Mostly UI stuff.

    return rules;
  }

  getConnectData() {
    return this.$http.$get(`/hosts/connect/${this.connect}`)
               .then(({ data }) => data);
  }

  fetchAgentInstallSnippets() {
    return this.$http.$get(`/wizard/agent/${this.id}`)
               .then(({ data }) => data);
  }

  getAlertHistory(from = 0, to = null, limit = 10) {
    to = to ?? Math.round(Date.now() / 1000);
    return this.$http.$get(
      `/hosts/${this.id}/alert-history?filter[from]=${from}&filter[to]=${to}&page[size]=${limit}`
               )
               .then(({ data }) => data);
  }

  connectIsIP() {
    return this.connect
           && /^[0-9]+\.[0-9]+\.[0-9]+\.+/i.test(this.connect);
  }

  fetchLatestData() {
    return this.$http.$get(`/hosts/${this.id}/latest-data`)
               .then(({ data }) => data);
  }

  fetchCpuUtilizationSnapshots() {
    return this.$http.$get(`/hosts/${this.id}/cpu-utilisation-snapshots`)
               .then(({ data }) => data);
  }

  serviceChecks() {
    return this.hasMany(ServiceCheck);
  }

  webChecks() {
    return this.hasMany(WebCheck);
  }

  customChecks() {
    return this.hasMany(CustomCheck);
  }

  snmpChecks() {
    return this.hasMany(SnmpCheck);
  }

  events() {
    return this.hasMany(Event);
  }

  jobmonResults() {
    return this.hasMany(JobmonResult);
  }

  makeCustomPortServiceCheck() {
    return ServiceCheck.newCustomPortCheck()
                       .for(this);
  }

  makeHttpPortServiceCheck() {
    return ServiceCheck.newHttpPortCheck()
                       .for(this);
  }

  makeICMPServiceCheck() {
    return ServiceCheck.newICMPCheck()
                       .for(this);
  }

  makeSSLCertificateServiceCheck() {
    return ServiceCheck.newSSLCertificateCheck()
                       .for(this);
  }

  relations() {
    return {
      frontman: Frontman
    };
  }
}
