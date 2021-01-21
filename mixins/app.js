export default {
  methods: {
    triggerRoute(pageUrl) {
      if (window.ga && window.ga.getAll) {
        const tracker = window.ga.getAll()[0];

        if (tracker) tracker.send('pageview', pageUrl);
      }

      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'Pageview',
          pagePath: pageUrl,
          pageTitle: document.title,
        });
      }
    },
    stringPreview(string, cutOff) {
      if (string.length <= cutOff) return string;

      return `${string.substring(0, cutOff)}...`;
    },
    /**
     * If you're using this copy functionality in a modal or popup of some sort
     * then you need to pass a ref to an element inside that modal etc. Other-
     * wise the copy won't succeed in Chrome on certain systems.
     *
     * @param textToCopy
     * @param successMsg
     * @param errorMsg
     * @param ele
     */
    copyText(textToCopy,
             successMsg = this.$t('message.success.copy'),
             errorMsg = this.$t('message.error.copy'),
             ele) {
      this.$copyText(textToCopy, ele)
          .then(() => {
            this.$flash.success(successMsg);
          })
          .catch(() => {
            this.$flash.error(errorMsg);
          });
    },
    capitalize(string) {
      return this.$options.filters.capitalize(string);
    },
  },
  computed: {
    isDevEnv() {
      return this.$config.environment === 'DEV';
    },
    isTestEnv() {
      return this.$config.environment === 'TEST';
    },
    isProdEnv() {
      return this.$config.environment === 'PROD';
    },
    app_knowledgeBaseUrl() {
      return this.$config.kbBasePath;
    },
    wwwBaseUrl() {
      return this.$config.wwwBasePath;
    },
    hubUrl() {
      return this.$config.hubUrl;
    },
  },
};
