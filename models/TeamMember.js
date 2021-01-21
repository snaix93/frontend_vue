import Model from './Model';

export default class TeamMember extends Model {
  static className = 'TeamMember';
  static persistableFilterKey = 'teamMember';
  static filters = {
    ...this.defaultFilters,
  };
  static attributes = {
    email: null,
    role: 'ROLE_TEAM_MEMBER',
    createRecipient: true,
  };
  static validationRules = {
    email: 'required|email|uniqueTeamEmail',
    createRecipient: 'required',
    role: 'required',
  };

  get isCloudRadarSupport() {
    return /support\+[0-9]+@cloudradar\.co/i.test(this.email);
  }

  static filter({ page, limit, sortBy, search, email }) {
    return super.filter({ page, limit, sortBy, search, email });
  }

  resendTeamMemberInvitation() {
    return this.$http.get(`/team-members/${this.id}/resend-invitation`, {
      action: 'RESEND_INVITATION',
    });
  }

  isReadOnlyRole(role) {
    return role === this.role;
  }
}
