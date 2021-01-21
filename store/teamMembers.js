import TeamMemberModel from '@/models/TeamMember';
import { useToggle } from '@/use/useToggles';

export const state = () => ({
  TeamMember: {},
  teamMembers: [],
  totalCount: 0,
  deleteDialog: false,
  selectedTeamMember: {},
  inviteSupportDialog: false,
  inviteTeamMemberDialog: false,
});

export const mutations = {
  setTeamMembers(state, teamMembers) {
    state.teamMembers = teamMembers;
  },
  setSelectedTeamMember(state, TeamMember) {
    state.selectedTeamMember = TeamMember.makeClone();
  },
  createTeamMember(state, TeamMember) {
    state.teamMembers.unshift(TeamMember);
    if (! TeamMember.isCloudRadarSupport) {
      this.$auth.team.counts.members += 1;
    }
    state.totalCount = state.teamMembers.length;
  },
  updateTeamMember(state, TeamMember) {
    const i = state.teamMembers.findIndex(({ id }) => id === TeamMember.id);
    state.teamMembers[i] = TeamMember;
  },
  deleteTeamMember(state, TeamMember) {
    const i = state.teamMembers.findIndex(({ id }) => id === TeamMember.id);
    state.teamMembers.splice(i, 1);
    if (! TeamMember.isCloudRadarSupport) {
      this.$auth.team.counts.members -= 1;
    }
    state.totalCount = state.teamMembers.length;
  },
  setPagination(state, { total }) {
    state.totalCount = total;
  },
  toggleDeleteDialog: useToggle('deleteDialog'),
  toggleSupportDialog: useToggle('inviteSupportDialog'),
  toggleTeamMemberDialog: useToggle('inviteTeamMemberDialog'),
};

export const actions = {
  async getTeamMembers({ commit }, { TeamMember = TeamMemberModel }) {
    this.$dispatchWait.start(this.$WAIT_FOR.TEAM_MEMBER.GET);
    try {
      const { data, meta } = await TeamMember.get();
      commit('setTeamMembers', data);
      commit('setPagination', meta.pagination);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.TEAM_MEMBER.GET);
    }
  },

  async inviteTeamMember({ commit }, { TeamMember }) {
    this.$dispatchWait.start(this.$WAIT_FOR.TEAM_MEMBER.CREATE);
    try {
      TeamMember.teamStatus = 'invited';
      await TeamMember.save();
      commit('createTeamMember', TeamMember);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.TEAM_MEMBER.CREATE);
    }
  },

  async updateTeamMemberRole({ commit }, { TeamMember }) {
    this.$dispatchWait.start(this.$WAIT_FOR.TEAM_MEMBER.UPDATE);
    try {
      await TeamMember.save();
      commit('updateTeamMember', TeamMember);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.TEAM_MEMBER.UPDATE);
    }
  },

  async deleteTeamMember({ commit }, { TeamMember }) {
    this.$dispatchWait.start(this.$WAIT_FOR.TEAM_MEMBER.DELETE);
    try {
      await TeamMember.delete();
      commit('deleteTeamMember', TeamMember);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.TEAM_MEMBER.DELETE);
    }
  },

  async updateTeamMemberLimitTag({ commit }, { TeamMember }) {
    this.$dispatchWait.start(this.$WAIT_FOR.TEAM_MEMBER.UPDATE);
    try {
      TeamMember.save();
      commit('updateTeamMember', TeamMember);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.TEAM_MEMBER.UPDATE);
    }
  },

  async updateTeamMemberSubUnit({ commit }, { TeamMember }) {
    this.$dispatchWait.start(this.$WAIT_FOR.TEAM_MEMBER.UPDATE);
    try {
      await TeamMember.save();
      commit('updateTeamMember', TeamMember);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.TEAM_MEMBER.UPDATE);
    }
  },

  async resendTeamMemberInvitation({ commit }, { TeamMember }) {
    this.$dispatchWait.start(this.$WAIT_FOR.TEAM_MEMBER.UPDATE_ID(TeamMember.id));
    this.$dispatchWait.start(this.$WAIT_FOR.TEAM_MEMBER.UPDATE);
    try {
      await TeamMember.resendTeamMemberInvitation();
      TeamMember.resend = true;

      commit('updateTeamMember', TeamMember);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.TEAM_MEMBER.UPDATE_ID(TeamMember.id));
      this.$dispatchWait.end(this.$WAIT_FOR.TEAM_MEMBER.UPDATE);
    }

  },
};
