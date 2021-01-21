import StatusPage from '@/models/StatusPage';
import { useToggle } from '@/use/useToggles';

export const state = () => ({
  statusPages: [],
  StatusPage: {},
  totalCount: 0,
  selectedStatusPage: {},
  statusPageDialog: false,
  embedCodeDialog: false,
  deleteDialog: false,
});

export const mutations = {
  setStatusPages(state, statusPages) {
    state.statusPages = statusPages;
  },
  setSelectedStatusPage(state, StatusPage) {
    state.selectedStatusPage = StatusPage ? StatusPage.makeClone() : {};
  },
  createStatusPage(state, statusPage) {
    state.statusPages.unshift(statusPage);
  },
  updateStatusPage(state, StatusPage) {
    const index = state.statusPages.findIndex(({ id }) => id === StatusPage.id);
    Object.keys(StatusPage).forEach((key) => {
      state.statusPages[index][key] = StatusPage[key];
    });
  },
  deleteStatusPage(state, StatusPage) {
    const index = state.statusPages.findIndex(({ id }) => id === StatusPage.id);
    state.statusPages.splice(index, 1);
  },
  setPagination(state, { total }) {
    state.totalCount = total;
  },
  toggleStatusPageDialog: useToggle('statusPageDialog'),
  toggleEmbedCodeDialog: useToggle('embedCodeDialog'),
  toggleDeleteDialog: useToggle('deleteDialog'),
};

export const actions = {
  async getStatusPages({ commit }, { StatusPageModel = StatusPage } = {}) {
    this.$dispatchWait.start(this.$WAIT_FOR.STATUS_PAGE.GET);
    try {
      const { data, meta } = await StatusPageModel.get();
      commit('setPagination', meta.pagination);
      commit('setStatusPages', data);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.STATUS_PAGE.GET);
    }
  },
  async createStatusPage({ commit }, { StatusPage }) {
    this.$dispatchWait.start(this.$WAIT_FOR.STATUS_PAGE.CREATE);
    try {
      const page = await StatusPage.save();
      commit('createStatusPage', StatusPage);
      return page;
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.STATUS_PAGE.CREATE);
    }
  },
  async createStatusPageImage({ commit }, { image, StatusPage }) {
    this.$dispatchWait.start(this.$WAIT_FOR.STATUS_PAGE.IMAGE_CREATE);
    try {
      const formData = new FormData();
      formData.append('image', image);
      await this.$axios.$post(`/status-pages/${StatusPage.id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      StatusPage.imageContentType = image.type || true;
      commit('updateStatusPage', StatusPage);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.STATUS_PAGE.IMAGE_CREATE);
    }
  },
  async updateStatusPage({ commit }, { StatusPage }) {
    this.$dispatchWait.start(this.$WAIT_FOR.STATUS_PAGE.UPDATE);
    try {
      StatusPage.save();
      commit('updateStatusPage', StatusPage);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.STATUS_PAGE.UPDATE);
    }
  },
  async deleteStatusPage({ commit }, { StatusPage }) {
    this.$dispatchWait.start(this.$WAIT_FOR.STATUS_PAGE.DELETE);
    try {
      await StatusPage.delete();
      commit('deleteStatusPage', StatusPage);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.STATUS_PAGE.DELETE);
    }
  },
  async deleteStatusPageImage({ commit }, { StatusPage }) {
    this.$dispatchWait.start(this.$WAIT_FOR.STATUS_PAGE.IMAGE_DELETE);
    try {
      await StatusPage.deleteImage();
      StatusPage.imageContentType = null;
      commit('updateStatusPage', StatusPage);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.STATUS_PAGE.IMAGE_DELETE);
    }
  },
};
