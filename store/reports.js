import ReportModel from '@/models/Report';

export const state = () => ({
  reports: [],
  Report: {},
  totalCount: 0,
});

export const mutations = {
  setReports(state, reports) {
    state.reports = reports;
  },
  setPagination(state, { total }) {
    state.totalCount = total;
  },
};

export const actions = {
  async getReports({ commit }, { Report = ReportModel } = {}) {
    this.$dispatchWait.start(this.$WAIT_FOR.REPORT.GET);
    try {
      const { data, meta } = await Report.get();
      commit('setPagination', meta.pagination);
      commit('setReports', data);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.REPORT.GET);
    }
  },
};
