import Vue from 'vue';
import FrontmanModel from '@/models/Frontman';
import { useToggle } from '@/use/useToggles';

export const state = () => ({
  frontmen: [],
  Frontman: {},
  selectedFrontman: {},
  frontmanDialog: false,
  deleteDialog: false,
  hostInfoDialog: false,
  installDialog: false,
  installSnippets: {},
});

export const getters = {
  lastCreatedFrontman(state) {
    return state.frontmen[state.frontmen.length - 1];
  },
};

export const mutations = {
  setFrontmen(state, frontmen) {
    state.frontmen = frontmen;
  },
  setFrontman(state, Frontman) {
    state.Frontman = Frontman;
  },
  setSelectedFrontman(state, Frontman) {
    state.selectedFrontman = Frontman.makeClone();
  },
  createFrontman(state, Frontman) {
    state.frontmen.unshift(Frontman);
  },
  updateFrontman(state, Frontman) {
    const index = state.frontmen.findIndex(({ id }) => id === Frontman.id);
    if (index > -1) {
      Object.keys(Frontman).forEach((key) => {
        state.frontmen[index][key] = Frontman[key];
      });
    }
  },
  deleteFrontman(state, Frontman) {
    const index = state.frontmen.findIndex(({ id }) => id === Frontman.id);
    state.frontmen.splice(index, 1);
  },
  setFrontmanInstallSnippets(state, { Frontman, snippets }) {
    Vue.set(state.installSnippets, Frontman.id, snippets);
  },
  toggleInstallDialog: useToggle('installDialog'),
  toggleDeleteDialog: useToggle('deleteDialog'),
  toggleFrontmanDialog: useToggle('frontmanDialog'),
  toggleHostInfoDialog: useToggle('hostInfoDialog'),
};

export const actions = {
  async getFrontmen({ commit }, { Frontman = FrontmanModel } = {}) {
    this.$dispatchWait.start(this.$WAIT_FOR.FRONTMAN.GET);
    try {
      const { data } = await Frontman.get();
      commit('setFrontmen', data);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.FRONTMAN.GET);
    }
  },

  async createFrontman({ commit }, { Frontman }) {
    this.$dispatchWait.start(this.$WAIT_FOR.FRONTMAN.CREATE);
    try {
      await Frontman.save();
      commit('createFrontman', Frontman);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.FRONTMAN.CREATE);
    }
  },

  async updateFrontman({ commit }, { Frontman }) {
    this.$dispatchWait.start(this.$WAIT_FOR.FRONTMAN.UPDATE);
    try {
      await Frontman.save();
      commit('updateFrontman', Frontman);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.FRONTMAN.UPDATE);
    }
  },

  async deleteFrontman({ commit }, { Frontman }) {
    this.$dispatchWait.start(this.$WAIT_FOR.FRONTMAN.DELETE_ID(Frontman.id));
    // this.$dispatchWait.start(this.$WAIT_FOR.FRONTMAN.DELETE);
    try {
      await Frontman.delete();
      commit('deleteFrontman', Frontman);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.FRONTMAN.DELETE_ID(Frontman.id));
      // this.$dispatchWait.end(this.$WAIT_FOR.FRONTMAN.DELETE);
    }
  },

  async getFrontmanInstallSnippets({ commit }, { Frontman }) {
    try {
      const snippets = await Frontman.fetchInstallSnippets();
      commit('setFrontmanInstallSnippets', { Frontman, snippets });
    } catch (error) {
      //
    }
  },
};
