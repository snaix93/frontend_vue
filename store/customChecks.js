import CustomCheck from '@/models/CustomCheck';
import { useToggle } from '@/use/useToggles';
import Vue from 'vue';

export const state = () => ({
  CustomCheck: {},
  customChecks: {},
  selectedCustomCheck: {},
  totalCount: {},
  customCheckDialog: false,
  deleteDialog: false,
});

export const getters = {
  getCustomChecksByHost: (state) => (Host) => {
    return state.customChecks?.[Host.id] ?? [];
  },
  getTotalCountByHost: (state) => (Host) => {
    return state.totalCount?.[Host.id] ?? 0;
  },
};

export const mutations = {
  setCustomChecks(state, { customChecks, Host }) {
    Vue.set(state.customChecks, Host.id, customChecks);
  },
  setCustomCheck(state, CustomCheck) {
    state.CustomCheck = CustomCheck;
  },
  setSelectedCustomCheck(state, CustomCheck) {
    state.selectedCustomCheck = CustomCheck.makeClone();
  },
  setPagination(state, { total, Host }) {
    Vue.set(state.totalCount, Host.id, total);
  },
  createCustomCheck(state, { CustomCheck, Host }) {
    state.customChecks[Host.id] = [
      CustomCheck,
      ...state.customChecks?.[Host.id] ?? [],
    ];
    state.totalCount[Host.id]++;
  },
  updateCustomCheck(state, { CustomCheck, Host }) {
    const index = state.customChecks[Host.id].findIndex(({ id }) => id === CustomCheck.id);
    if (index > -1) {
      state.customChecks[Host.id].splice(index, 1, CustomCheck);
      Vue.set(state.customChecks, Host.id, [
        ...state.customChecks[Host.id],
      ]);
    }
  },
  deleteCustomCheck(state, { CustomCheck, Host }) {
    const index = state.customChecks[Host.id].findIndex(({ id }) => id === CustomCheck.id);
    state.customChecks[Host.id].splice(index, 1);
    state.totalCount[Host.id]--;
  },
  resetSelectedCustomCheck(state, Host) {
    state.selectedCustomCheck = new CustomCheck({ ...CustomCheck.attributes }).for(Host);
  },
  toggleDeleteDialog: useToggle('deleteDialog'),
  toggleCustomCheckDialog: useToggle('customCheckDialog'),
};

export const actions = {
  async getCustomChecks({ commit }, { CustomCheck, Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.CUSTOM_CHECK.GET);
    try {
      const { data, meta } = await CustomCheck.get();
      commit('setCustomChecks', { customChecks: data, Host });
      commit('setPagination', { total: meta.pagination.total, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.CUSTOM_CHECK.GET);
    }
  },

  async createCustomCheck({ commit }, { CustomCheck, Host }) {
    try {
      await CustomCheck.save();
      commit('createCustomCheck', { CustomCheck, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.CUSTOM_CHECK.CREATE);
    }
  },

  async updateCustomCheck({ commit }, { CustomCheck, Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.CUSTOM_CHECK.UPDATE);
    try {
      await CustomCheck.save();
      commit('updateCustomCheck', { CustomCheck, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.CUSTOM_CHECK.UPDATE);
    }
  },

  async deleteCustomCheck({ commit }, { CustomCheck, Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.CUSTOM_CHECK.DELETE);
    try {
      await CustomCheck.delete();
      commit('deleteCustomCheck', { CustomCheck, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.CUSTOM_CHECK.DELETE);
    }
  },
};
