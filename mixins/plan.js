import { mapActions, mapState } from 'vuex';

export default {
  computed: {
    ...mapState('user', {
      _checkoutData: 'checkoutData'
    }),
    plan_userCanCancelPlan() {
      return ! this.$auth.team.onTrial()
             && ! this.$auth.team.onFrozenPlan()
             && ! this.$auth.team.onFreePlan();
    },
    plan_userChangedPlan() {
      return this._checkoutData.paid
             && 'plan' in this._checkoutData
             && this.$auth.team.plan !== this._checkoutData.plan;
    },
    plan_userUpgradedPlan() {
      return ! this.$auth.team.onPaygPlan()
             && this._checkoutData.plan === 'payg';
    },
    plan_userCanceledPlan() {
      // if user has plan with monthly payment canceled_at should have a value
      const hasCanceledAtValue = 'canceled_at' in this._checkoutData && this._checkoutData.canceled_at !== null;
      return this.plan_userCanCancelPlan
             && (hasCanceledAtValue || this._checkoutData.plan === 'frozen');
    },
  },
  methods: {
    ...mapActions('user', {
      _getCheckoutData: 'getCheckoutData'
    }),
    async plan_checkForPlanChanges() {
      this.$wait.start(this.$WAIT_FOR.USER.CHECKOUT_DATA);
      try {
        await this._getCheckoutData({ User: this.$auth.user });
        if (this.plan_userChangedPlan) {
          let message;
          if (this.plan_userUpgradedPlan) {
            message = this.$t('message.success.planUpgraded', {
              plan: this._checkoutData.plan.toUpperCase()
            });
          } else if (this.plan_userCanceledPlan) {
            message = this.$t('message.success.planCancelled', {
              plan: this.$auth.team.plan.toUpperCase()
            });
          }

          this.$store.commit('app/setAppBlanketMessage', message);
          this.$wait.start(this.$WAIT_FOR.APP.BLANKET);
          setTimeout(() => {
            window.location = '/settings';
          }, 1000);
        }
      } finally {
        this.$wait.end(this.$WAIT_FOR.USER.CHECKOUT_DATA);
      }
    },
  },
};
