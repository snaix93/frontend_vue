const tooltips = {
  HOST_FORM_FRONTMAN: '/tooltips/host/addHostFrontman',
  HOST_FORM_AGENT: '/tooltips/host/addHostAgent',
  HOST_FORM_MUTED: '/tooltips/host/mute',
  HOST_CHECK_SERVICE: '/tooltips/checks/standardChecks',
  HOST_CHECK_CUSTOM: '/tooltips/checks/CustomCheck',
  HOST_CHECK_SNMP: '/tooltips/checks/snmpCheck',
  HOST_CHECK_ICMP_PING: '/tooltips/checks/ICMPPing',
  HOST_CHECK_WEBSITE: '/tooltips/checks/WebsiteCheck',
  HOST_DELETE: '/tooltips/host/delete',
  NAV_HOSTS: '/tooltips/mainMenu/hosts',
  NAV_RECIPIENTS: '/tooltips/mainMenu/recipients',
  NAV_RULES: '/tooltips/mainMenu/rules',
  NAV_TEAM: '/tooltips/mainMenu/team',
  RULE_FORM: '/tooltips/rules/addEditRule',
  RULE_NUM_RUNNING_PROCESSES: '/tooltips/rules/numOfRunningProcessesCheck',
  RULE_CUSTOM_CHECK_KEY: '/tooltips/rules/customCheckKey',
  RULE_FORM_IGNORE: '/tooltips/rules/ignoreRule',
  RULE_FORM_EXIT: '/tooltips/rules/finishOption',
  PROCESSES_STATE: '/tooltips/latestData/processes/state',
  FRONTMAN_DISCONNECT: '/tooltips/frontmen/disconnect',
  USER_SETTINGS_DATA_CENTER: '/tooltips/account/datacenter',
};

const buildTooltipStore = (tooltipKeys) => {
  const $store = { state: {}, mutations: {}, actions: {} };

  Object.entries(tooltipKeys).forEach(([tooltipKey, contentUri]) => {
    $store.state[tooltipKey] = null;
    $store.mutations[tooltipKey] = (state, body) => {
      state[tooltipKey] = body;
    };
    $store.actions[tooltipKey] = async function ({ commit }) {
      commit(tooltipKey, await this.$axios.$get(contentUri, { headers: { 'Content-Type': 'text/html' } }));
    };
  });

  const state = { ...$store.state };
  $store.state = () => state;

  return $store;
};

export const { state, mutations, actions } = buildTooltipStore(tooltips);
