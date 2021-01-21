import Vue from 'vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify, {
  theme: {
    // Vuetify theme properties
    primary: '#008D8B',
    secondary: '#00528D',
    accent: '#008D8B',
    error: '#C62828',
    info: '#50B6EF',
    success: '#00C77F',
    warning: '#FFA000',
    // CloudRadar additional properties
    tertiary: '#C6F94C',
    highlight: '#F76240',
    themes: {
      dark: {
        anchor: '#FFFFFF',
      }
    },
  },
  options: {
    customProperties: true,
  },
});
