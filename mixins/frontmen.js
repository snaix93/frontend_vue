import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState('frontmen', {
      _frontmen: 'frontmen'
    }),
    frontmen_frontmenMaxSize() {
      return this.$auth.team?.maxFrontmen || 0;
    },
    frontmen_frontmenExceeded() {
      return this._frontmen.length >= this.frontmen_frontmenMaxSize;
    },
    frontmen_frontmenRemaining() {
      return this.frontmen_frontmenMaxSize - this._frontmen.length;
    },
  },
};
