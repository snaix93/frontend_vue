import Vue from 'vue';
import collect from 'collect.js';
import HostModel from '@/models/Host';
import { useToggle } from '@/use/useToggles';

export const state = () => ({
  hosts: [],
  Host: {},
  hostSummaryList: [],
  totalCount: 0,
  totalHostCount: 0,
  selectedHost: {},
  availableServiceChecks: null,
  updateDialog: false,
  deleteDialog: false,
  inventoryDialog: false,
  guideDialog: false,
  agentDialog: false,
  agentSetupHelpOverlay: false,
  agentInstallSnippets: {},
  checkSuccessDialog: false,
  latestData: {},
  selectedMeasurement: {},
  graphDialog: false,
  measurementsPrintView: 'grid',
  hyperVMetricDialog: false,
  selectedHyperVMetric: {},
  cpuUtilizationSnapshots: {},
  addRuleForCustomKeyDialog: false,
  addRuleForProcessDialog: false,
  addRuleForServiceDialog: false,
  addRuleForSNMPDialog: false,
  selectedItemForNewRule: {},
  selectedProcessForNewRule: {},
  selectedServiceForNewRule: {},
  lastUpdateTimeFromServer: null,
});

export const getters = {
  lastCreatedHost(state) {
    return state.hosts[state.hosts.length - 1];
  },
  availableServiceChecks(state) {
    if (! state.availableServiceChecks) return [];

    let tcp = collect(state.availableServiceChecks.tcp).map((port, service) => {
      return {
        key: service === 'submission' ? 'smtp' : service,
        port: port,
        protocol: 'tcp',
      };
    });

    let udp = collect(state.availableServiceChecks.udp).map((port, service) => {
      return {
        key: service,
        port: port,
        protocol: 'udp',
      };
    });

    const checks = tcp.merge(udp.all()).values();

    checks.push({ key: 'custom', port: 'custom' });

    return checks.all();
  },
  latestData(state) {
    if (! state.latestData) return {};

    let data = state.latestData;

    if ('serviceChecks' in data && data.serviceChecks.length) {
      data.serviceChecks.forEach((check) => {
        check.measurements = check.measurements.map((measurement) => {
          measurement.dataUpdatedAt = check.dataUpdatedAt;

          return measurement;
        });
      });
    }

    if ('webChecks' in data && data.webChecks.length) {
      data.webChecks.forEach((check) => {
        check.measurements = check.measurements.map((measurement) => {
          measurement.dataUpdatedAt = check.dataUpdatedAt;

          return measurement;
        });
      });
    }

    if ('customChecks' in data && data.customChecks.length) {
      data.customChecks.forEach((check) => {
        check.measurements = check.measurements.map((measurement) => {
          measurement.dataUpdatedAt = check.dataUpdatedAt;

          return measurement;
        });
      });
    }

    if ('snmpChecks' in data && data.snmpChecks.length) {
      data.snmpChecks.forEach((check) => {

        if (Array.isArray(check.measurements)) {
          check.hasSubItems = false;

          check.measurements = check.measurements.map((measurement) => {
            measurement.dataUpdatedAt = check.dataUpdatedAt;

            return measurement;
          });

        } else {
          check.hasSubItems = true;

          check.measurements = Object.keys(check.measurements).map((key) => {
            const measurements = check.measurements[key];

            const subItem = {
              name: key,
              measurements,
            };

            subItem.measurements = subItem.measurements.map((measurement) => {
              measurement.dataUpdatedAt = check.dataUpdatedAt;

              return measurement;
            });

            return subItem;
          });
        }
      });
    }

    if ('osMetrics' in data.cagent && data.cagent.osMetrics.length) {
      data.cagent.osMetrics.forEach((item) => {
        item.dataUpdatedAt = data.cagent.dataUpdatedAt;
      });
    }

    if ('hwInventory' in data.cagent) {
      let hwInventory = [];
      hwInventory.push(data.cagent.hwInventory.hwInventory);
      data.cagent.hwInventory.hwInventory = hwInventory;
    }

    if ('smartmon' in data.cagent) {
      let smartmon = {
        disks: [],
        messages: [],
      };
      let disks = [];
      let messages = [];

      Object.keys(data.cagent.smartmon).forEach((key) => {
        const value = data.cagent.smartmon[key];

        if (key === 'messages') {
          messages.push({
            key,
            value,
          });
        } else {
          disks.push({
            key,
            ...value,
          });
        }
      });

      smartmon.disks = smartmon.disks.concat(disks);
      smartmon.messages = smartmon.messages.concat(messages);

      data.cagent.smartmon = smartmon;
    }

    return data;
  },
};

export const mutations = {
  setHosts(state, hosts) {
    state.hosts = hosts;
  },
  setHost(state, Host) {
    state.Host = Host;
  },
  setSelectedHost(state, Host) {
    state.selectedHost = Host.makeClone();
  },
  setPagination(state, { total }) {
    state.totalCount = total;
  },
  createHost(state, Host) {
    state.hosts.unshift(Host);
    this.$auth.team.counts.hosts += 1;
  },
  updateHosts(state, Host) {
    const index = state.hosts.findIndex(({ id }) => id === Host.id);
    if (index > -1) {
      Object.keys(Host).forEach((key) => {
        state.hosts[index][key] = Host[key];
      });
    }
  },
  deleteHost(state, Host) {
    const index = state.hosts.findIndex(({ id }) => id === Host.id);
    this.$auth.team.counts.hosts -= 1;
    state.hosts.splice(index, 1);
  },
  setAvailableServiceChecks(state, availableServiceChecks) {
    state.availableServiceChecks = availableServiceChecks;
  },
  setHostsHash(state, hash) {
    state.hostsHash = hash;
  },
  setTotalHostCount(state, count) {
    state.totalHostCount = count;
  },
  setAgentInstallSnippets(state, { Host, snippets }) {
    Vue.set(state.agentInstallSnippets, Host.id, snippets);
  },
  setLatestData: (state, latestData) => {
    state.latestData = latestData;
  },
  setHostCpuUtilizationSnapshots(state, { Host, snapshots }) {
    Vue.set(state.cpuUtilizationSnapshots, Host.id, snapshots);
  },
  setHostSummaryList(state, hosts) {
    state.hostSummaryList = hosts;
  },
  setSelectedMeasurement: (state, measurement) => {
    state.selectedMeasurement = measurement;
  },
  setMeasurementsPrintView: (state, view) => {
    state.measurementsPrintView = view;
  },
  setSelectedHyperVMetric(state, hyperVMetric) {
    state.selectedHyperVMetric = hyperVMetric;
  },
  setSelectedItemForNewRule(state, item) {
    state.selectedItemForNewRule = item;
  },
  setSelectedProcessForNewRule(state, item) {
    state.selectedProcessForNewRule = item;
  },
  setSelectedServiceForNewRule(state, item) {
    state.selectedServiceForNewRule = item;
  },
  // TODO - v2:v3 merge check
  setLastUpdateTimeFromServer(state, lastUpdateTimeFromServer) {
    state.lastUpdateTimeFromServer = lastUpdateTimeFromServer;
  },
  toggleHyperVMetricDialog: useToggle('hyperVMetricDialog'),
  toggleGraphDialog: useToggle('graphDialog'),
  toggleCheckSuccessDialog: useToggle('checkSuccessDialog'),
  toggleDeleteDialog: useToggle('deleteDialog'),
  toggleInventoryDialog: useToggle('inventoryDialog'),
  toggleGuideDialog: useToggle('guideDialog'),
  toggleAgentDialog: useToggle('agentDialog'),
  toggleAgentSetupHelpOverlay: useToggle('agentSetupHelpOverlay'),
  toggleUpdateDialog: useToggle('updateDialog'),
  toggleAddRuleForServiceDialog: useToggle('addRuleForServiceDialog'),
  toggleAddRuleForProcessDialog: useToggle('addRuleForProcessDialog'),
  toggleAddRuleForCustomKeyDialog: useToggle('addRuleForCustomKeyDialog'),
  toggleAddRuleForSNMPDialog: useToggle('addRuleForSNMPDialog'),
};

export const actions = {
  async getHosts({ commit }, { Host = HostModel } = {}) {
    this.$dispatchWait.start(this.$WAIT_FOR.HOST.GET);
    try {
      const { data, meta } = await Host.get();
      commit('setHosts', data);
      commit('setPagination', meta.pagination);
      commit('setHostsHash', meta.hostsHash);
      commit('setTotalHostCount', meta.hostCount);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.HOST.GET);
    }
  },

  async getHostById({ commit, dispatch }, { id }) {
    this.$dispatchWait.start(this.$WAIT_FOR.HOST.GET);
    try {
      const Host = await HostModel.find(id);
      commit('setHost', Host);
      commit('setAvailableServiceChecks', Host.getLastRequestMeta('availableServiceChecks'));
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.HOST.GET);
    }
  },

  async createHost({ commit }, { Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.HOST.CREATE);
    try {
      await Host.save();
      commit('createHost', Host);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.HOST.CREATE);
    }
  },

  async updateHost({ commit }, { Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.HOST.UPDATE);
    try {
      await Host.save();
      commit('updateHosts', Host);
      commit('setHost', Host);
      commit('setAvailableServiceChecks', Host.getLastRequestMeta('availableServiceChecks'));
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.HOST.UPDATE);
    }
  },

  async deleteHost({ commit }, { Host, purgeReports: complete = false }) {
    this.$dispatchWait.start(this.$WAIT_FOR.HOST.DELETE_ID(Host.id));
    this.$dispatchWait.start(this.$WAIT_FOR.HOST.DELETE);
    try {
      await Host.params({ complete }).delete();
      commit('deleteHost', Host);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.HOST.DELETE_ID(Host.id));
      this.$dispatchWait.end(this.$WAIT_FOR.HOST.DELETE);
    }
  },

  async nonAssignmentUpdate({ commit }, { Host }) {
    await Host.patchSave();
    commit('setHostsHash', null);
  },

  async getAgentInstallSnippets({ commit }, { Host }) {
    try {
      const snippets = await Host.fetchAgentInstallSnippets();
      commit('setAgentInstallSnippets', { Host, snippets });
    } catch (error) {
      //
    }
  },
  async getLatestData({ commit }, { Host }) {
    try {
      const measurements = await Host.fetchLatestData();
      commit('setLatestData', measurements);
    } catch (error) {
      //
    }
  },

  async getHostCpuUtilizationSnapshots({ commit }, { Host }) {
    try {
      const snapshots = await Host.fetchCpuUtilizationSnapshots();
      commit('setHostCpuUtilizationSnapshots', { Host, snapshots });
    } catch (error) {
      //
    }
  },

  async getHostSummaryList({ commit }) {
    try {
      const hosts = await HostModel.fetchHostSummaryList();
      commit('setHostSummaryList', hosts);
    } catch (error) {
      //
    }
  },
};
