export const state = () => ({
  email: '',
  verified: null,
});

export const mutations = {
  setEmail(state, email) {
    state.email = email;
  },
  setVerified(state, verified) {
    state.verified = verified;
  },
};
