export const state = () => ({
  showMiniCharts: false,
});

export const mutations = {
  setShowMiniCharts(state, toggle) {
    // state.showMiniCharts = toggle;
    state.showMiniCharts = false;
  },
};

export const actions = {
  async toggleMiniCharts({ commit }, toggle) {
    // TODO
    // const settingKey = 'setShowMiniCharts';
    // const results = await this.$axios.$get(`/user-settings/${settingKey}`);
    // commit('setShowMiniCharts', toggle);
  },
};
