export const state = () => ({
  selectedUser: {},
  userAppSettings: {},
  checkoutData: {},
  userEstimatedRegion: '',
});

export const mutations = {
  setSelectedUser(state, User) {
    state.selectedUser = User.makeClone();
  },
  setCheckoutData(state, checkoutData) {
    state.checkoutData = checkoutData;
  },
  setUserEstimatedRegion(state, region) {
    state.userEstimatedRegion = region;
  },
};

export const actions = {
  async updateUser({ commit }, { User }) {
    this.$dispatchWait.start(this.$WAIT_FOR.USER.UPDATE);
    try {
      await User.save();
      await this.$hardRefreshUser();
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.USER.UPDATE);
    }
  },

  async deleteUser({ commit }, { User, confirmation, reason }) {
    this.$dispatchWait.start(this.$WAIT_FOR.USER.DELETE);
    try {
      await User.params({
        'confirmation-phrase': confirmation,
        reason: reason
      }).delete();
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.USER.DELETE);
    }
  },

  async registerUserAction({ commit }, payload) {
    this.$dispatchWait.start(this.$WAIT_FOR.AUTH.SIGNUP);
    try {
      await this.$axios.$post('/auth/register', payload);
    } finally {
      setTimeout(() => {
        this.$dispatchWait.end(this.$WAIT_FOR.AUTH.SIGNUP);
      }, 100);
    }
  },

  async unsubscribeMarketing({ commit }, { User }) {
    this.$dispatchWait.start(this.$WAIT_FOR.USER.UPDATE);
    try {
      await User.marketingUnsubscribe();
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.USER.UPDATE);
    }
  },

  async getUserEstimatedRegion({ commit }) {
    const { data } = await this.$axios.$get('/user/geo');
    commit('setUserEstimatedRegion', data.region);
  },

  async getCheckoutData({ commit }, { User }) {
    this.$dispatchWait.start(this.$WAIT_FOR.USER.CHECKOUT_DATA);
    try {
      const checkoutData = await User.fetchCheckoutData();
      commit('setCheckoutData', checkoutData);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.USER.CHECKOUT_DATA);
    }
  },
};
