import RecipientModel from '@/models/Recipient';
import { useToggle } from '@/use/useToggles';

export const state = () => ({
  recipients: [],
  Recipient: {},
  selectedRecipient: {},
  totalCount: 0,
  recipientDialog: false,
  deleteDialog: false,
  logsDialog: false,
});

export const mutations = {
  setRecipients(state, recipients) {
    state.recipients = recipients;
  },
  setPagination(state, { total }) {
    state.totalCount = total;
  },
  setSelectedRecipient(state, Recipient) {
    state.selectedRecipient = Recipient.makeClone();
  },
  resetSelectedRecipient(state, mediaType = null) {
    switch (mediaType) {
      case 'email':
        state.selectedRecipient = new RecipientModel({ ...RecipientModel.MailRecipientAttributes });
        break;
      default:
        state.selectedRecipient = new RecipientModel({ ...RecipientModel.attributes });
    }
    if (mediaType !== null) {
      state.selectedRecipient.setMediaTypeTo(mediaType);
    }
  },
  createRecipient(state, Recipient) {
    state.recipients.unshift(Recipient);
    state.totalCount = state.recipients.length;
  },
  updateRecipient(state, Recipient) {
    const index = state.recipients.findIndex(({ id }) => id === Recipient.id);
    Object.keys(Recipient).forEach((key) => {
      state.recipients[index][key] = Recipient[key];
    });
  },
  deleteRecipient(state, Recipient) {
    const index = state.recipients.findIndex(({ id }) => id === Recipient.id);
    state.recipients.splice(index, 1);
    state.totalCount = state.recipients.length;
  },
  toggleDeleteDialog: useToggle('deleteDialog'),
  toggleLogsDialog: useToggle('logsDialog'),
  toggleRecipientDialog: useToggle('recipientDialog'),
};

export const actions = {
  async getRecipients({ commit }, { Recipient = RecipientModel } = {}) {
    this.$dispatchWait.start(this.$WAIT_FOR.RECIPIENT.GET);
    try {
      const { data, meta } = await Recipient.get();
      commit('setRecipients', data);
      commit('setPagination', meta.pagination);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.RECIPIENT.GET);
    }
  },

  async createRecipient({ commit }, { Recipient }) {
    this.$dispatchWait.start(this.$WAIT_FOR.RECIPIENT.CREATE);
    try {
      await Recipient.save();
      commit('createRecipient', Recipient);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.RECIPIENT.CREATE);
    }
  },

  async updateRecipient({ commit }, { Recipient }) {
    this.$dispatchWait.start(this.$WAIT_FOR.RECIPIENT.UPDATE);
    try {
      await Recipient.save();
      commit('updateRecipient', Recipient);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.RECIPIENT.UPDATE);
    }
  },

  async deleteRecipient({ commit }, { Recipient }) {
    this.$dispatchWait.start(this.$WAIT_FOR.RECIPIENT.DELETE_ID(Recipient.id));
    try {
      await Recipient.delete();
      commit('deleteRecipient', Recipient);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.RECIPIENT.DELETE_ID(Recipient.id));
    }
  },

  async resendVerificationEmail({ commit }, { Recipient }) {
    this.$dispatchWait.start(this.$WAIT_FOR.RECIPIENT.UPDATE_ID(Recipient.id));
    this.$dispatchWait.start(this.$WAIT_FOR.RECIPIENT.UPDATE);
    try {
      await Recipient.resendVerificationEmail();
      commit('updateRecipient', Recipient);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.RECIPIENT.UPDATE_ID(Recipient.id));
      this.$dispatchWait.end(this.$WAIT_FOR.RECIPIENT.UPDATE);
    }
  },
};
