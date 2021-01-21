import { useToggle } from '@/use/useToggles';

export const state = () => ({
  appDrawer: null,
  appToolbar: true,
  appFooter: true,
  appDrawerMini: null,
  lastUpdateTime: null,
  currentRoute: '',
  appOverlay: false,
  appBlanketMessage: null,
  confirmDialog: false,
  successDialog: false,
  supportDialog: false,
  supportSubject: '',
  supportBody: '',
  legalLinks: {
    imprint: 'https://cloudradar.io/imprint',
    terms: 'https://cloudradar.io/service-terms',
    privacy: 'https://cloudradar.io/privacy-policy',
  },
  pricing: {
    currencies: {
      euro: '€',
      usd: '$',
    },
    payg: {
      perHost: {
        euro: '1.50',
        usd: '1.70',
      },
    },
  },
});

export const mutations = {
  showAppOverlay(state) {
    state.appOverlay = true;
  },
  hideAppOverlay(state) {
    state.appOverlay = false;
  },
  setCurrentRoute(state, route) {
    state.currentRoute = route;
  },
  setAppBlanketMessage(state, appBlanketMessage = null) {
    state.appBlanketMessage = appBlanketMessage;
  },
  toggleConfirmDialog(state, show) {
    state.confirmDialog = show;
  },
  showConfirmDialog(state) {
    state.confirmDialog = true;
  },
  hideConfirmDialog(state) {
    state.confirmDialog = false;
  },
  showSuccessDialog(state) {
    state.successDialog = true;
  },
  hideSuccessDialog(state) {
    state.successDialog = false;
  },
  showSupportDialog(state) {
    state.supportDialog = true;
  },
  hideSupportDialog(state) {
    state.supportDialog = false;
  },
  setLastUpdateTime(state, value) {
    state.lastUpdateTime = value;
  },
  setSupportSubject(state, value) {
    state.supportSubject = value;
  },
  setSupportBody(state, value) {
    state.supportBody = value;
  },
  toggleAppDrawer: useToggle('appDrawer'),
  toggleAppToolbar: useToggle('appToolbar'),
  toggleAppFooter: useToggle('appFooter'),
  toggleAppDrawerMini: useToggle('appDrawerMini'),
};

export const actions = {
  setCurrentRoute({ commit }, route) {
    commit('setCurrentRoute', route);
  },
};
