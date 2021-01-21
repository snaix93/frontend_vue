import SubUnitModel from '@/models/SubUnit';

export const state = () => ({
  subUnits: [],
  SubUnit: {},
  selectedSubUnit: {},
  subUnitDialog: false,
  deleteDialog: false,
});

export const getters = {
  lastCreatedSubUnit(state) {
    return state.subUnits[state.subUnits.length - 1];
  },
};

export const mutations = {
  setSubUnits(state, subUnits) {
    state.subUnits = subUnits;
  },
  setSubUnit(state, SubUnit) {
    state.SubUnit = SubUnit;
  },
  setSelectedSubUnit(state, SubUnit) {
    state.selectedSubUnit = SubUnit.makeClone();
  },
  createSubUnit(state, SubUnit) {
    state.subUnits.unshift(SubUnit);
  },
  updateSubUnit(state, SubUnit) {
    const index = state.subUnits.findIndex(({ id }) => id === SubUnit.id);
    Object.keys(SubUnit).forEach((key) => {
      state.subUnits[index][key] = SubUnit[key];
    });
  },
  deleteSubUnit(state, SubUnit) {
    const index = state.subUnits.findIndex(({ id }) => id === SubUnit.id);
    state.subUnits.splice(index, 1);
  },
  toggleSubUnitDialog(state, show = null) {
    state.subUnitDialog = show !== null ? show : !state.subUnitDialog;
  },
  toggleDeleteDialog(state, show = null) {
    state.deleteDialog = show !== null ? show : !state.deleteDialog;
  },
};

export const actions = {
  async getSubUnits({ commit }, { SubUnit = SubUnitModel } = {}) {
    this.$dispatchWait.start(this.$WAIT_FOR.SUB_UNIT.GET);
    try {
      const { data } = await SubUnit.get();
      commit('setSubUnits', data);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.SUB_UNIT.GET);
    }
  },

  async createSubUnit({ commit }, { SubUnit }) {
    this.$dispatchWait.start(this.$WAIT_FOR.SUB_UNIT.CREATE);
    try {
      await SubUnit.save();
      commit('createSubUnit', SubUnit);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.SUB_UNIT.CREATE);
    }
  },

  async updateSubUnit({ commit }, { SubUnit }) {
    this.$dispatchWait.start(this.$WAIT_FOR.SUB_UNIT.UPDATE);
    try {
      await SubUnit.save();
      commit('updateSubUnit', SubUnit);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.SUB_UNIT.UPDATE);
    }
  },

  async deleteSubUnit({ commit }, { SubUnit }) {
    this.$dispatchWait.start(this.$WAIT_FOR.SUB_UNIT.DELETE);
    try {
      await SubUnit.delete();
      commit('deleteSubUnit', SubUnit);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.SUB_UNIT.DELETE);
    }
  },
};
