import Model from '@/models/Model';

export default class Recipient extends Model {
  static className = 'Recipient';
  static persistableFilterKey = 'recipient';
  static filters = {
    ...this.defaultFilters,
  };
  static attributes = {
    active: true,
    mediatype: 'email',
    sendto: null,
    alerts: true,
    warnings: true,
    recoveries: true,
    reminders: true,
    maximumReminders: 6,
    reminderDelay: 240 * 60,
  };

  static MailRecipientAttributes = {
    ...Recipient.attributes,
    dailySummary: true,
  };

  isVerified() {
    return this.verified || this.mediatype !== 'email';
  }

  hasLogs() {
    return this.mediatype === 'webhook';
  }

  setMediaTypeTo(mediaType) {
    this.mediatype = mediaType;
  }

  resendVerificationEmail() {
    return this.$http.$post(`/recipients/${this.id}/resend-verification-email`);
  }
}
