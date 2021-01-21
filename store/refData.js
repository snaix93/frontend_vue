export const state = () => ({
  publicFrontmen: [],
  timezones: [],
});

export const mutations = {
  setTimezones(state, timezones) {
    state.timezones = timezones;
  },
  setPublicFrontmen(state, publicFrontmen) {
    state.publicFrontmen = publicFrontmen;
  }
};

export const actions = {
  async getTimezones({ commit }) {
    this.$dispatchWait.start(this.$WAIT_FOR.REF_DATA.TIMEZONES);
    try {
      const { data } = await this.$axios.$get('/ref-data/timezones');
      commit('setTimezones', data);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.REF_DATA.TIMEZONES);
    }
  },
  async getPublicFrontmen({ commit }) {
    this.$dispatchWait.start(this.$WAIT_FOR.REF_DATA.FRONTMEN);
    try {
      const { data } = await this.$axios.$get('/ref-data/frontmen');
      commit('setPublicFrontmen', data);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.REF_DATA.FRONTMEN);
    }
  },
};
