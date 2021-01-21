export const actions = {
  async saveOnboardingPayload({ commit }, { step, payload }) {
    this.$dispatchWait.start(this.$WAIT_FOR.ONBOARD.SAVE);
    try {
      await this.$axios.post(`onboard/${step}`, payload);
      await this.$hardRefreshUser();
    } catch (error) {
      this.$dispatchWait.end(this.$WAIT_FOR.ONBOARD.SAVE);
      throw error;
    }
  },
};
