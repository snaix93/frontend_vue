import Model from '@/models/Model';
import Setting from '@/models/Setting';
import Vue from 'vue';

export default class User extends Model {
  static className = 'User';
  static resource = 'user';
  static userRoles = {
    READ_ONLY: 'ROLE_READ_ONLY',
    ADMIN: 'ROLE_TEAM_ADMIN'
  };

  get username() {
    return this?.nickname || this?.email || this?.id;
  }

  get emailVerified() {
    return this.dates.verifiedAt !== null;
  }

  /**
   * ROLE / PERMISSION HELPERS
   */
  isReadOnly() {
    return this.roles === User.userRoles.READ_ONLY;
  }

  isNotReadOnly() {
    return this.roles !== User.userRoles.READ_ONLY;
  }

  isAdmin() {
    return this.roles === User.userRoles.ADMIN;
  }

  /**
   * @return {boolean}
   */
  onTrial() {
    return this.team.onTrial();
  }

  /**
   * @return {boolean}
   */
  onFreePlan() {
    return this.team.onFreePlan();
  }

  /**
   * @return {boolean}
   */
  onProPlan() {
    return this.team.onProPlan();
  }

  /**
   * @return {boolean}
   */
  onPaygPlan() {
    return this.team.onPaygPlan();
  }

  /**
   * @return {boolean}
   */
  onFrozenPlan() {
    return this.team.onFrozenPlan();
  }

  /**
   * @return {boolean}
   */
  onTrialOrFrozenPlan() {
    return this.team.onTrial() || this.team.onFrozenPlan();
  }

  /**
   * @return {boolean}
   */
  hasSubUnit() {
    return !! this?.subUnit;
  }

  hasCompletedTeamSettings() {
    return this.team.timezone !== 'NOTSET'
           && this.team.defaultFrontman !== '00000000-0000-0000-0000-000000000000';
  }

  needsOnboarding() {
    return !this.team?.onboarded;
  }

  marketingUnsubscribe() {
    return this.$http.$post(`/marketing-emails/${this.id}/${this.team.id}`)
               .then(({ data }) => data);
  }

  changePassword({ oldPassword, password, passwordConfirmation }) {
    return this.$http.$post('user/password', {
      oldPassword,
      password,
      passwordConfirmation
    }).then(({ data }) => data);
  }

  fetchCheckoutData() {
    return this.$http.$get('/checkout-data')
               .then(({ data }) => data);
  }

  resendVerificationEmail() {
    return this.$http.$post('/auth/verify/resend');
  }

  set settings(value) {
    this._settings = Vue.observable(value);
  }
  get settings() {
    return Setting.createForModel(this);
  }
};
