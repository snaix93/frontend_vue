import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState('app', ['pricing']),
    user_username() {
      return this.$auth?.user?.username ?? '';
    },
    user_currency() {
      const currency = this.$auth.team?.currency || 'euro';
      return {
        symbol: this.pricing.currencies[currency],
        iso: currency,
      };
    },
    user_trialRemaining() {
      return this.$auth.team?.trialRemainingDays || 0;
    },
    user_trialRemainingPhrase() {
      if (this.user_trialRemaining === 0) {
        return this.$t('settings.dayLeft', { num: '< 1' });
      }
      return this.$t('settings.daysLeft', { num: this.user_trialRemaining });
    },
  },
};
