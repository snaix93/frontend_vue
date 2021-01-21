import TeamActivityModel from '@/models/TeamActivity';

export const state = () => ({
  teamActivities: [],
  TeamActivity: {},
  totalCount: 0,
});

export const mutations = {
  setTeamActivities(state, teamActivities) {
    state.teamActivities = teamActivities;
  },
  setPagination(state, { total }) {
    state.totalCount = total;
  },
};

export const actions = {
  async getTeamActivities({ commit }, { TeamActivity = TeamActivityModel } = {}) {
    this.$dispatchWait.start(this.$WAIT_FOR.TEAM_ACTIVITY.GET);
    try {
      const { data, meta } = await TeamActivity.get();
      commit('setTeamActivities', data);

      commit('setPagination', meta.pagination);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.TEAM_ACTIVITY.GET);
    }
  },
};
