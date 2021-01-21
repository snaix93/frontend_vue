export const state = () => ({
  selectedTeam: {},
  inviteTeamMemberDialog: false,
  inviteSupportDialog: false,
});

export const mutations = {
  setSelectedTeam(state, Team) {
    state.selectedTeam = Team.makeClone();
  },
  hasGrantedAccessToSupport(state, hideSupportButton){
    this.$auth.team.hasGrantedAccessToSupport = hideSupportButton;
  },
};

export const actions = {
  async updateTeam({ commit }, {Team}) {
    this.$dispatchWait.start(this.$WAIT_FOR.TEAM.UPDATE);
    try {
      Team.hasGrantedAccessToSupport = !!Team.hasGrantedAccessToSupport;
      await Team.save();
      await this.$hardRefreshUser();
    }  finally {
      this.$dispatchWait.end(this.$WAIT_FOR.TEAM.UPDATE);
    }
  },

  async hideSupportButton({ commit }, hideSupportButton) {
    await this.$axios.$put('/team', {
      hasGrantedAccessToSupport: hideSupportButton
    });

    commit('hasGrantedAccessToSupport', hideSupportButton)
  },
};
