export default {
  methods: {
    async useCheckout_getHandoverAndUpgrade(User) {
      this.$wait.start(this.$WAIT_FOR.USER.CHECKOUT_DATA);

      User.fetchCheckoutData()
        .then(({ handover }) => {
          const upgradeWindow = window.open('', '_blank');
          upgradeWindow.location.href = `${handover.baseUrl}/upgrade`
          upgradeWindow.focus();
        })
        .catch(() => {
          this.$flash.error(this.$t('message.error.openCheckoutUpgrade'));
        })
        .finally(() => {
          this.$wait.end(this.$WAIT_FOR.USER.CHECKOUT_DATA);
        });
    },
    useCheckout_open(baseUrl, action) {
      const checkoutWindow = window.open('', '_blank');
      checkoutWindow.location.href = `${baseUrl}/${action}`
      checkoutWindow.focus();
    },
    useCheckout_openBankMandate(url) {
      const mandateWindow = window.open(window.location.href, '_blank');
      mandateWindow.location = url;
      mandateWindow.focus();
    },
  },
};
