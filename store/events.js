import EventModel from '@/models/Event';
import { useToggle } from '@/use/useToggles';

export const state = () => ({
  events: [],
  Event: {},
  totalCount: 0,
  selectedEvent: {},
  deleteDialog: false,
  deleteReminderDialog: false,
});

export const mutations = {
  setEvents(state, events) {
    state.events = events;
  },
  setEvent(state, Event) {
    state.Event = Event;
  },
  setSelectedEvent(state, Event) {
    state.selectedEvent = Event.makeClone();
  },
  setPagination(state, { total }) {
    state.totalCount = total;
  },
  updateEvent(state, Event) {
    const index = state.events.findIndex(({ id }) => id === Event.id);
    if (index > -1) {
      Object.keys(Event).forEach((key) => {
        state.events[index][key] = Event[key];
      });
    }
  },
  deleteEvent(state, Event) {
    const index = state.events.findIndex(({ id }) => id === Event.id);
    state.events.splice(index, 1);
  },
  toggleDeleteDialog: useToggle('deleteDialog'),
  toggleReminderDeleteDialog: useToggle('deleteReminderDialog'),
};

export const actions = {
  async getEvents({ commit }, { Event = EventModel } = {}) {
    this.$dispatchWait.start(this.$WAIT_FOR.EVENT.GET);
    try {
      const { data, meta = null } = await Event.get();
      commit('setEvents', data);
      if (meta) {
        commit('setPagination', meta.pagination);
      }
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.EVENT.GET);
    }
  },

  async updateEvent({ commit }, { Event }) {
    this.$dispatchWait.start(this.$WAIT_FOR.EVENT.UPDATE);
    try {
      await Event.save();
      commit('updateEvent', Event);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.EVENT.UPDATE);
    }
  },

  async deleteEvent({ commit }, { Event }) {
    this.$dispatchWait.start(this.$WAIT_FOR.EVENT.DELETE_ID(Event.id));
    this.$dispatchWait.start(this.$WAIT_FOR.EVENT.DELETE);
    try {
      await Event.delete();
      commit('deleteEvent', Event);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.EVENT.DELETE_ID(Event.id));
      this.$dispatchWait.end(this.$WAIT_FOR.EVENT.DELETE);
    }
  },
};
