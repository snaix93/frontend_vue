import { useToggle } from '@/use/useToggles';
import Vue from 'vue';

export const state = () => ({
  serviceChecks: {},
  ServiceCheck: {},
  selectedServiceCheck: {},
  totalCount: {},
  serviceCheckDialog: false,
  ICMPCheckDialog: false,
  deleteDialog: false,
});

export const getters = {
  getServiceChecksByHost: (state) => (Host) => {
    return state.serviceChecks?.[Host.id] ?? [];
  },
  getTotalCountByHost: (state) => (Host) => {
    return state.totalCount?.[Host.id] ?? 0;
  },
};

export const mutations = {
  setServiceChecks(state, { serviceChecks, Host }) {
    Vue.set(state.serviceChecks, Host.id, serviceChecks);
  },
  setServiceCheck(state, ServiceCheck) {
    state.ServiceCheck = ServiceCheck;
  },
  setSelectedServiceCheck(state, ServiceCheck) {
    state.selectedServiceCheck = ServiceCheck.makeClone();
  },
  setPagination(state, { total, Host }) {
    Vue.set(state.totalCount, Host.id, total);
  },
  createServiceCheck(state, { ServiceCheck, Host }) {
    state.serviceChecks[Host.id] = [
      ServiceCheck,
      ...state.serviceChecks?.[Host.id] ?? [],
    ];
    state.totalCount[Host.id]++;
  },
  updateServiceCheck(state, { ServiceCheck, Host }) {
    const index = state.serviceChecks[Host.id].findIndex(({ id }) => id === ServiceCheck.id);
    if (index > -1) {
      state.serviceChecks[Host.id].splice(index, 1, ServiceCheck);
      Vue.set(state.serviceChecks, Host.id, [
        ...state.serviceChecks[Host.id],
      ]);
    }
  },
  deleteServiceCheck(state, { ServiceCheck, Host }) {
    const index = state.serviceChecks[Host.id].findIndex(({ id }) => id === ServiceCheck.id);
    state.serviceChecks[Host.id].splice(index, 1);
    state.totalCount[Host.id]--;
  },
  resetSelectedServiceCheck(state, Host) {
    state.selectedServiceCheck = Host.makeHttpPortServiceCheck();
  },
  resetSelectedServiceCheckToCustomPort(state, Host) {
    state.selectedServiceCheck = Host.makeCustomPortServiceCheck();
  },
  resetSelectedServiceCheckToICMP(state, Host) {
    state.selectedServiceCheck = Host.makeICMPServiceCheck();
  },
  resetSelectedServiceCheckToSSLCertificateCheck(state, Host) {
    state.selectedServiceCheck = Host.makeSSLCertificateServiceCheck();
  },
  toggleServiceCheckDialog: useToggle('serviceCheckDialog'),
  toggleICMPCheckDialog: useToggle('ICMPCheckDialog'),
  toggleDeleteDialog: useToggle('deleteDialog'),
};

export const actions = {
  async getServiceChecks({ commit }, { ServiceCheck, Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.SERVICE_CHECK.GET);
    try {
      const { data, meta } = await ServiceCheck.get();
      commit('setServiceChecks', { serviceChecks: data, Host });
      commit('setPagination', { total: meta.pagination.total, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.SERVICE_CHECK.GET);
    }
  },

  async createServiceCheck({ commit }, { ServiceCheck, Host }) {
    if (ServiceCheck.isPreflighting) {
      this.$dispatchWait.start(this.$WAIT_FOR.SERVICE_CHECK.PREFLIGHT);
    } else {
      this.$dispatchWait.start(this.$WAIT_FOR.SERVICE_CHECK.CREATE);
    }

    try {
      await ServiceCheck.save();
      commit('createServiceCheck', { ServiceCheck, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.SERVICE_CHECK.PREFLIGHT);
      this.$dispatchWait.end(this.$WAIT_FOR.SERVICE_CHECK.CREATE);
    }
  },

  async updateServiceCheck({ commit }, { ServiceCheck, Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.SERVICE_CHECK.UPDATE);
    try {
      await ServiceCheck.save();
      commit('updateServiceCheck', { ServiceCheck, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.SERVICE_CHECK.UPDATE);
    }
  },

  async deleteServiceCheck({ commit }, { ServiceCheck, Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.SERVICE_CHECK.DELETE);
    try {
      await ServiceCheck.delete();
      commit('deleteServiceCheck', { ServiceCheck, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.SERVICE_CHECK.DELETE);
    }
  },
};
