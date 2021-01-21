import HostModel from '@/models/Host';
import { useToggle } from '@/use/useToggles';

export const state = () => ({
  JobmonResult: {},
  jobmonResults: [],
  selectedJobmonResult: {},
  totalCount: 0,
  jobmonInfoDialog: false,
  jobmonResultDialog: false,
  deleteDialog: false,
  jobmonResultFullData: {},
});

export const mutations = {
  setJobmonResults(state, jobmonResults) {
    state.jobmonResults = jobmonResults;
  },
  setJobmonResult(state, JobmonResult) {
    state.JobmonResult = JobmonResult;
  },
  setSelectedJobmonResult(state, JobmonResult) {
    state.selectedJobmonResult = JobmonResult.makeClone();
  },
  setPagination(state, { total }) {
    state.totalCount = total;
  },
  deleteJobmonResult(state, JobmonResult) {
    const index = state.jobmonResults.findIndex(({ jobId }) => jobId === JobmonResult.jobId);
    state.jobmonResults.splice(index, 1);
  },
  setJobmonResultFullData(state, JobmonResult) {
    state.jobmonResultFullData = JobmonResult;
  },
  toggleDeleteDialog: useToggle('deleteDialog'),
  toggleJobmonInfoDialog: useToggle('jobmonInfoDialog'),
  toggleJobmonResultDialog: useToggle('jobmonResultDialog'),
};

export const actions = {
  async getJobmonResults({ commit }, { JobmonResult }) {
    this.$dispatchWait.start(this.$WAIT_FOR.JOBMON_RESULT.GET);
    try {
      const { data, meta } = await JobmonResult.get();
      commit('setJobmonResults', data);
      commit('setPagination', meta.pagination);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.JOBMON_RESULT.GET);
    }
  },

  async getJobmonResultFullDataByJobId({ commit }, { hostId, jobId }) {
    this.$dispatchWait.start(this.$WAIT_FOR.JOBMON_RESULT.GET);
    try {
      const JobmonResult = await new HostModel({ id: hostId })
        .jobmonResults()
        .find(jobId);
      commit('setJobmonResultFullData', JobmonResult);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.JOBMON_RESULT.GET);
    }
  },

  async deleteJobmonResult({ commit }, { JobmonResult }) {
    this.$dispatchWait.start(this.$WAIT_FOR.JOBMON_RESULT.DELETE);
    try {
      await JobmonResult.delete();
      commit('deleteJobmonResult', JobmonResult);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.JOBMON_RESULT.DELETE);
    }
  },
};
