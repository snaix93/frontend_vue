export const state = () => ({
  videoDialog: false,
});

export const getters = {
  videoDialog(state) {
    return state.videoDialog;
  },
};

export const mutations = {
  showVideoDialog(state) {
    state.videoDialog = true;
  },
  hideVideoDialog(state) {
    state.videoDialog = false;
  },
};

export const actions = { };
