import RuleModel from '@/models/Rule';
import { useToggle } from '@/use/useToggles';

export const state = () => ({
  Rule: {},
  rules: [],
  ruleHosts: [],
  selectedRule: {},
  processes: {
    process: undefined,
    cmdline: undefined,
  },
  addRuleDialog: false,
  deleteDialog: false,
});

export const getters = {
  getBaseRuleForRuleWizard: state => ruleType => Object.assign(
    JSON.parse(JSON.stringify(RuleModel.attributes)),
    JSON.parse(JSON.stringify(RuleModel.wizardBaseRules[ruleType])),
  ),
  getProcesses: (state) => (type) => {
    return state.processes?.[type] ?? null;
  },
};

export const mutations = {
  setRules(state, rules) {
    state.rules = rules;
  },
  setSelectedRule(state, Rule) {
    state.selectedRule = Rule.makeClone();
  },
  resetSelectedRule(state) {
    state.selectedRule = new RuleModel({ ...RuleModel.customRuleAttributes });
  },
  createRule(state, rule) {
    state.rules.push(rule);
  },
  updateRule(state, editedRule) {
    const ruleIndex = state.rules.findIndex(rule => rule.id === editedRule.id);

    Object.keys(editedRule).forEach((k) => {
      state.rules[ruleIndex][k] = editedRule[k];
    });
  },
  deleteRule(state, deletedRule) {
    const ruleIndex = state.rules.findIndex(rule => rule.id === deletedRule.id);

    state.rules.splice(ruleIndex, 1);
  },
  setProcesses(state, { processes, type }) {
    state.processes[type] = processes;
  },
  toggleDeleteDialog: useToggle('deleteDialog'),
  toggleAddRuleDialog: useToggle('addRuleDialog'),
};

export const actions = {
  async getRules({ commit }, { Rule = RuleModel } = {}) {
    this.$dispatchWait.start(this.$WAIT_FOR.RULE.GET);
    try {
      const { data } = await Rule.get();
      commit('setRules', data);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.RULE.GET);
    }
  },
  async addRule({ commit }, { Rule }) {
    this.$dispatchWait.start(this.$WAIT_FOR.RULE.CREATE);
    try {
      await Rule.save();
      commit('createRule', Rule);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.RULE.CREATE);
    }
  },
  async updateRule({ commit }, { Rule }) {
    this.$dispatchWait.start(this.$WAIT_FOR.RULE.UPDATE);
    try {
      await Rule.save();
      commit('updateRule', Rule);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.RULE.UPDATE);
    }
  },

  async nonAssignmentUpdate({ commit }, { Rule }) {
    this.$dispatchWait.start(this.$WAIT_FOR.RULE.UPDATE);
    if (Rule?.keyFunction) {
      Rule.keyFunction = JSON.stringify(Rule.keyFunction);
    }
    await Rule.patchSave();
    this.$dispatchWait.end(this.$WAIT_FOR.RULE.UPDATE);
  },

  async deleteRule({ commit }, { Rule }) {
    this.$dispatchWait.start(this.$WAIT_FOR.RULE.DELETE_ID(Rule.id));
    this.$dispatchWait.start(this.$WAIT_FOR.RULE.DELETE);
    try {
      await Rule.delete();
      commit('deleteRule', Rule);
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.RULE.DELETE_ID(Rule.id));
      this.$dispatchWait.end(this.$WAIT_FOR.RULE.DELETE);
    }
  },
  async updateRulePosition(context, { Rule }) {
    this.$dispatchWait.start(this.$WAIT_FOR.RULE.UPDATE);
    try {
      await this.$axios.$patch(`/rules/${Rule.id}/position`, { position: Rule.position });
    } finally {
      this.$dispatchWait.end(this.$WAIT_FOR.RULE.UPDATE);
    }
  },
  async fetchProcesses({ commit }, { type }) {
    const { data } = await this.$axios.$get(`/rules/processes/${type}`);
    commit('setProcesses', { processes: data, type });
    return data;
  },
};
