import moment from 'moment';
import HostActivityModel from '@/models/HostActivity';

export const state = () => ({
  hostActivities: [],
  HostActivity: {},
  totalCount: 0,
  content: {},
  // dont change this fixed epoch date - we weren't saving this data prior to this date.
  hostActivityEpoch: moment('2018-11'),
});

export const mutations = {
  setHostActivities(state, hostActivities) {
    state.hostActivities = hostActivities;
  },
  setPagination(state, { total }) {
    state.totalCount = total;
  },
  setContent(state, content) {
    state.content = content;
  },
};

export const actions = {
  async getHostActivities({ commit }, { HostActivity = HostActivityModel } = {}) {
    this.$dispatchWait.start(this.$WAIT_FOR.HOST_ACTIVITY.GET);
    try {
      const { data, meta } = await HostActivity.get();
      commit('setHostActivities', data);

      if(meta.pagination)
        commit('setPagination', meta.pagination);
      if(meta.content)
        commit('setContent', meta.content);
    }
    finally {
      this.$dispatchWait.end(this.$WAIT_FOR.HOST_ACTIVITY.GET);
    }
  },
};
