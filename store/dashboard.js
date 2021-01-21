import { useToggle } from '@/use/useToggles';

export const state = () => ({
  hosts: [],
  Host: {},
  dashboardCounts: {
    items: 0,
    pages: 0,
  },
  totalHostCount: 0,
  aggregatedData: [],
  AggregatedHostData: {},
  webCheckWizardDialog: false,
  selectedCharts: null,
  hideHostDialog: false,
  miniGraphDialog: false,
  focusChartsDialog: false,
  eventsDialog: false,
  TVMode: false,
  welcomeScreenShown: false,
});

export const mutations = {
  setHosts(state, hosts) {
    state.hosts = hosts;
  },
  setHost(state, Host) {
    state.Host = Host;
  },
  setDashboardCounts(state, { total, totalPages }) {
    state.dashboardCounts.items = total;
    state.dashboardCounts.pages = totalPages;
  },
  setTotalHostCount(state, total) {
    state.totalHostCount = total;
  },
  setAggregatedData(state, data) {
    state.aggregatedData = data;
  },
  setAggregatedHostData(state, AggregatedHostData) {
    state.AggregatedHostData = AggregatedHostData;
  },
  updateHosts(state, Host) {
    const index = state.hosts.findIndex(({ id }) => id === Host.id);
    if (index > -1) {
      Object.keys(Host).forEach((key) => {
        state.hosts[index][key] = Host[key];
      });
    }
  },
  removeHost(state, Host) {
    const index = state.hosts.findIndex(({ id }) => id === Host.id);
    state.hosts.splice(index, 1);
  },
  setSelectedCharts(state, array) {
    state.selectedCharts = array;
  },
  setWelcomeScreenShown(state) {
    state.welcomeScreenShown = true;
  },
  toggleHideHostDialog: useToggle('hideHostDialog'),
  toggleMiniGraphDialog: useToggle('miniGraphDialog'),
  toggleFocusChartsDialog: useToggle('focusChartsDialog'),
  toggleEventsDialog: useToggle('eventsDialog'),
  toggleWebCheckWizardDialog: useToggle('webCheckWizardDialog'),
  toggleTVMode: useToggle('TVMode'),
};

export const actions = {
  async getHosts({ commit }, { Host } = {}) {
    const { data, meta } = await Host
      .where('dashboard-only', true)
      .append('summary', 'events')
      .get();

    commit('setHosts', data);
    commit('setDashboardCounts', meta.pagination);
    commit('setTotalHostCount', meta.hostCount);
  },

  async getAggregatedHostData({ commit }, { AggregatedHostData }) {
    const { data, meta } = await AggregatedHostData.get();

    commit('setAggregatedData', data);
    commit('setDashboardCounts', meta.pagination);
  },

  async removeHostFromDashboard({ commit }, { Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.HOST.ID(Host.id));
    try {
      await Host.patchSave();
      commit('removeHost', Host);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.HOST.ID(Host.id));
    }
  },
};
