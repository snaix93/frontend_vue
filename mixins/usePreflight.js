export default {
  data() {
    return {
      usePreflight_preflightError: false,
      usePreflight_preflightResult: null,
    };
  },
  computed: {
    usePreflight_hasError() {
      return this.usePreflight_preflightError;
    },
  },
  methods: {
    usePreflight_togglePreflightOn(Host, checkType, Check) {
      this.usePreflight_togglePreflight('on', Host, checkType, Check);
    },
    usePreflight_togglePreflightOff(Host, checkType, Check) {
      this.usePreflight_togglePreflight('off', Host, checkType, Check);
    },
    usePreflight_togglePreflight(state, Host, checkType, Check) {
      if ((Host.frontman && Host.frontman.type !== 'public') || (checkType !== 'webCheck' && Check.id)) {
        Check.preflight = false;
      } else {
        switch (state) {
          case 'on':
            Check.preflight = true;
            break;
          case 'off':
            Check.preflight = false;
            break;
        }
      }
    },
    usePreflight_preflightReset() {
      this.usePreflight_preflightError = false;
      this.usePreflight_preflightResult = null;
    },
    usePreflight_renderResponseError(preflightResponseData) {
      let { console } = preflightResponseData;
      this.usePreflight_preflightError = true;

      if (Array.isArray(console)) {
        const cmd = console[0];
        const cmdResult = console.length > 1
                          ? console.slice(1).join(', ')
                          : '';
        this.usePreflight_preflightResult = { cmd, cmdResult };
      } else {
        this.usePreflight_preflightResult = console;
      }
    }
  },
};
