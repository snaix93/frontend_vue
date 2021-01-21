import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState('recipients', {
      _recipients: 'recipients',
      _Recipient: 'Recipient',
    }),
    recipient_recipientsExceeded() {
      return this.$auth.team.maxRecipients !== 0 && this._recipients.length >= this.$auth.team.maxRecipients;
    },
    recipient_recipientsRemaining() {
      return this.$auth.team.maxRecipients - this._recipients.length;
    },
  },
  methods: {
    recipient_showLogs(_Recipient) {
      this.$emit('on-getLogs', _Recipient);
    },
    recipient_verificationMessage({ administrativelyDisabled }, isButton = false) {
      let result;
      if (!! administrativelyDisabled) {
        result = `<strong>${this.$t('recipients.recipientAdministrativelyDisabled')}</strong><br>`;

        if (!! isButton) {
          result += `${this.$t('recipients.clickButtonToResendVerificationLink')}`;
        } else {
          result += `${this.$t('recipients.useResendVerificationLinkToReEnable')}`;
        }
      } else {
        result = `<strong>${this.$t('recipients.emailHasNotBeenConfirmedYet')}</strong><br>`;

        if (!! isButton) {
          result += `${this.$t('recipients.clickButtonToResendVerificationLink')}`;
        } else {
          result += `${this.$t('recipients.useResendVerificationLinkToEnable')}`;
        }
      }

      return result;
    },
  },
};
