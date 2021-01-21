import { useToggle } from '@/use/useToggles';

export const state = () => ({
  tokens: [],
  totalCount: 0,
  selectedToken: {},
  tokenDialog: false,
  deleteDialog: false,
});

export const mutations = {
  setTokens(state, tokens) {
    state.tokens = tokens;
  },
  setPagination(state, total) {
    state.totalCount = total;
  },
  setSelectedToken(state, token) {
    state.selectedToken = token;
  },
  createToken(state, token) {
    state.tokens.unshift(token);
    state.totalCount = state.tokens.length;
  },
  updateToken(state, updatedToken) {
    const tokenIndex = state.tokens.findIndex(
      token => token.id === updatedToken.id,
    );
    state.tokens[tokenIndex] = updatedToken;
  },
  deleteToken(state, deletedToken) {
    const tokenIndex = state.tokens.findIndex(
      token => token.id === deletedToken.id,
    );
    state.tokens.splice(tokenIndex, 1);
    state.totalCount = state.tokens.length;
  },
  toggleTokenDialog: useToggle('tokenDialog'),
  toggleDeleteDialog: useToggle('deleteDialog'),
};

export const actions = {
  async getTokens({ commit }) {
    this.$dispatchWait.start(this.$WAIT_FOR.API_TOKEN.GET);
    try {
      const { data } = await this.$axios.$get('/api-tokens/');
      commit('setTokens', data);
      commit('setPagination', data.length);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.API_TOKEN.GET);
    }
  },
  async createToken({ commit }, { name, capability }) {
    this.$dispatchWait.start(this.$WAIT_FOR.API_TOKEN.CREATE);
    try {
      const { data } = await this.$axios.$post('/api-tokens/', {
        name,
        capability,
      });
      commit('createToken', data);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.API_TOKEN.CREATE);
    }
  },
  async deleteToken({ commit }, token) {
    this.$dispatchWait.start(this.$WAIT_FOR.API_TOKEN.DELETE_ID(token.id));
    try {
      await this.$axios.$delete(`/api-tokens/${token.id}`);
      commit('deleteToken', token);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.API_TOKEN.DELETE_ID(token.id));
    }
  },
};
