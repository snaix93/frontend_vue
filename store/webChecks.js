import WebCheck from '@/models/WebCheck';
import { useToggle } from '@/use/useToggles';
import Vue from 'vue';

export const state = () => ({
  WebCheck: {},
  webChecks: {},
  selectedWebCheck: {},
  totalCount: {},
  webCheckDialog: false,
  deleteDialog: false,
  authorizationHeaderDialog: false,
});

export const getters = {
  getWebChecksByHost: (state) => (Host) => {
    return state.webChecks?.[Host.id] ?? [];
  },
  getTotalCountByHost: (state) => (Host) => {
    return state.totalCount?.[Host.id] ?? 0;
  },
};

export const mutations = {
  setWebChecks(state, { webChecks, Host }) {
    Vue.set(state.webChecks, Host.id, webChecks);
  },
  setWebCheck(state, WebCheck) {
    state.WebCheck = WebCheck;
  },
  setSelectedWebCheck(state, WebCheck) {
    state.selectedWebCheck = WebCheck.makeClone();
  },
  setPagination(state, { total, Host }) {
    Vue.set(state.totalCount, Host.id, total);
  },
  createWebCheck(state, { WebCheck, Host }) {
    state.webChecks[Host.id] = [
      WebCheck,
      ...state.webChecks?.[Host.id] ?? [],
    ];
    state.totalCount[Host.id]++;
  },
  updateWebCheck(state, { WebCheck, Host }) {
    const index = state.webChecks[Host.id].findIndex(({ id }) => id === WebCheck.id);
    if (index > -1) {
      state.webChecks[Host.id].splice(index, 1, WebCheck);
      Vue.set(state.webChecks, Host.id, [
        ...state.webChecks[Host.id],
      ]);
    }
  },
  deleteWebCheck(state, { WebCheck, Host }) {
    const index = state.webChecks[Host.id].findIndex(({ id }) => id === WebCheck.id);
    state.webChecks[Host.id].splice(index, 1);
    state.totalCount[Host.id]--;
  },
  resetSelectedWebCheck(state, Host) {
    state.selectedWebCheck = new WebCheck({ ...WebCheck.attributes }).for(Host);
  },
  toggleWebCheckDialog: useToggle('webCheckDialog'),
  toggleDeleteDialog: useToggle('deleteDialog'),
  toggleAuthorizationHeaderDialog: useToggle('authorizationHeaderDialog'),
};

export const actions = {
  async getWebChecks({ commit }, { WebCheck, Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.WEB_CHECK.GET);
    try {
      const { data, meta } = await WebCheck.get();
      commit('setWebChecks', { webChecks: data, Host });
      commit('setPagination', { total: meta.pagination.total, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.WEB_CHECK.GET);
    }
  },

  async createWebCheck({ commit }, { WebCheck, Host }) {
    if (WebCheck.isPreflighting) {
      this.$dispatchWait.start(this.$WAIT_FOR.WEB_CHECK.PREFLIGHT);
    } else {
      this.$dispatchWait.start(this.$WAIT_FOR.WEB_CHECK.CREATE);
    }

    try {
      await WebCheck.save();
      commit('createWebCheck', { WebCheck, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.WEB_CHECK.PREFLIGHT);
      this.$dispatchWait.end(this.$WAIT_FOR.WEB_CHECK.CREATE);
    }
  },

  async updateWebCheck({ commit }, { WebCheck, Host }) {
    if (WebCheck.isPreflighting) {
      this.$dispatchWait.start(this.$WAIT_FOR.WEB_CHECK.PREFLIGHT);
    } else {
      this.$dispatchWait.start(this.$WAIT_FOR.WEB_CHECK.UPDATE);
    }

    try {
      await WebCheck.save();
      commit('updateWebCheck', { WebCheck, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.WEB_CHECK.PREFLIGHT);
      this.$dispatchWait.end(this.$WAIT_FOR.WEB_CHECK.UPDATE);
    }
  },

  async deleteWebCheck({ commit }, { WebCheck, Host }) {
    this.$dispatchWait.start(this.$WAIT_FOR.WEB_CHECK.DELETE);
    try {
      await WebCheck.delete();
      commit('deleteWebCheck', { WebCheck, Host });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.WEB_CHECK.DELETE);
    }
  },
};
