import Model from '@/models/Model';
import Setting from '@/models/Setting';
import Vue from 'vue';

export default class Team extends Model {
  static className = 'Team';
  static resource = 'team';

  /**
   * PLAN HELPERS
   */
  onFreePlan() {
    return this.plan === 'free';
  }
  onProPlan() {
    return this.plan === 'pro';
  }
  onPaygPlan() {
    return this.plan === 'payg';
  }
  onFrozenPlan() {
    return this.plan === 'frozen';
  }
  onTrial() {
    return !this.onFreePlan() && this.trial === true;
  }

  set settings(value) {
    this._settings = Vue.observable(value);
  }
  get settings() {
    return Setting.createForModel(this);
  }
}
