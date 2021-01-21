import SnmpCheck from '@/models/SnmpCheck';
import { useToggle } from '@/use/useToggles';
import Vue from 'vue';

export const state = () => ({
  SnmpCheck: {},
  snmpChecks: {},
  selectedSnmpCheck: {},
  totalCount: {},
  snmpCheckDialog: false,
  deleteDialog: false,
  presets: ['basedata', 'bandwidth'],
});

export const getters = {
  getSnmpChecksByHost: (state) => (Host) => {
    return state.snmpChecks?.[Host.id] ?? [];
  },
  getTotalCountByHost: (state) => (Host) => {
    return state.totalCount?.[Host.id] ?? 0;
  },
};

export const mutations = {
  setSnmpChecks(state, { snmpChecks, Host }) {
    Vue.set(state.snmpChecks, Host.id, snmpChecks);
  },
  setSnmpCheck(state, SnmpCheck) {
    state.SnmpCheck = SnmpCheck;
  },
  setSelectedSnmpCheck(state, SnmpCheck) {
    state.selectedSnmpCheck = SnmpCheck.makeClone();
  },
  setPagination(state, { total, Host }) {
    Vue.set(state.totalCount, Host.id, total);
  },
  createSnmpCheck(state, { SnmpCheck, Host }) {
    state.snmpChecks[Host.id] = [
      SnmpCheck,
      ...state.snmpChecks?.[Host.id] ?? [],
    ];
    state.totalCount[Host.id]++;
  },
  updateSnmpCheck(state, { SnmpCheck, Host }) {
    const index = state.snmpChecks[Host.id].findIndex(({ id }) => id === SnmpCheck.id);
    if (index > -1) {
      state.snmpChecks[Host.id].splice(index, 1, SnmpCheck);
      Vue.set(state.snmpChecks, Host.id, [
        ...state.snmpChecks[Host.id],
      ]);
    }
  },
  deleteSnmpCheck(state, { SnmpCheck, Host }) {
    const index = state.snmpChecks[Host.id].findIndex(({ id }) => id === SnmpCheck.id);
    state.snmpChecks[Host.id].splice(index, 1);
    state.totalCount[Host.id]--;
  },
  resetSelectedSnmpCheck(state, Host) {
    state.selectedSnmpCheck = new SnmpCheck({ ...SnmpCheck.attributes }).for(Host);
  },
  toggleSnmpCheckDialog: useToggle('snmpCheckDialog'),
  toggleDeleteDialog: useToggle('deleteDialog'),
};

export const actions = {
  async getSnmpChecks({ commit }, { SnmpCheck, Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.SNMP_CHECK.GET);
    try {
      const { data, meta } = await SnmpCheck.get();
      commit('setSnmpChecks', { snmpChecks: data, Host });
      commit('setPagination', { total: meta.pagination.total, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.SNMP_CHECK.GET);
    }
  },

  async createSnmpCheck({ commit }, { SnmpCheck, Host }) {
    try {
      await SnmpCheck.save();
      commit('createSnmpCheck', { SnmpCheck, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.SNMP_CHECK.CREATE);
    }
  },

  async updateSnmpCheck({ commit }, { SnmpCheck, Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.SNMP_CHECK.UPDATE);
    try {
      await SnmpCheck.save();
      commit('updateSnmpCheck', { SnmpCheck, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.SNMP_CHECK.UPDATE);
    }
  },

  async deleteSnmpCheck({ commit }, { SnmpCheck, Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.SNMP_CHECK.DELETE);
    try {
      await SnmpCheck.delete();
      commit('deleteSnmpCheck', { SnmpCheck, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.SNMP_CHECK.DELETE);
    }
  },
};
