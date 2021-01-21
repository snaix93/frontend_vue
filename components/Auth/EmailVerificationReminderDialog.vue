<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
    persistent
  >
    <v-card class="position-relative">
      <v-card-title class="headline grey lighten-2 pt-3" primary-title>
        {{ $t('auth.emailNotVerified.title') }}
      </v-card-title>
      <v-card-text>
        {{ $t('auth.emailNotVerified.body') }}
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          :disabled="$wait.is($WAIT_FOR.AUTH.RESEND)"
          flat
          @click="onCancel"
        >
          <slot name="button-cancel">
            {{ $t('button.cancel') }}
          </slot>
        </v-btn>
        <ThrottledButton
          :loading="$wait.is($WAIT_FOR.AUTH.RESEND)"
          color="secondary"
          urls="auth/verify/resend"
          @click="resendVerificationEmail"
        >
          {{ $t('phrase.resend') | capitalize }}
        </ThrottledButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import Cookie from 'js-cookie';
  import { EmailVerificationReminderRefresherSymbol } from '@/constants/symbols';
  import BackendValidationAlert from '@/components/App/BackendValidationAlert';
  import ThrottledButton from '@/components/App/ThrottledButton';
  import { useRefresher } from '@/use/useRefresher';

  const EmailVerificationReminderRefresher = useRefresher(EmailVerificationReminderRefresherSymbol);

  export default {
    name: 'EmailVerificationReminderDialog',
    components: { BackendValidationAlert, ThrottledButton },
    data() {
      return {
        dialog: false,
      };
    },
    mounted() {
      setTimeout(this.shouldShow, 750);
      EmailVerificationReminderRefresher.refreshRate = 60 * 10 /*10 MINUTES*/;
      EmailVerificationReminderRefresher.onRefresh(this.shouldShow);
      EmailVerificationReminderRefresher.start();
    },
    beforeDestroy() {
      EmailVerificationReminderRefresher.stop();
    },
    methods: {
      shouldShow() {
        if (this.dialog) return;

        const verifyEmailReminderUnix = +(Cookie.get('verify_email_reminder_unix') ?? 0);
        const now = Math.round(Date.now() / 1000);
        const nowPlusShowAgainTime = now + (60 * 60 * 10 /*10 HOURS*/);

        if (verifyEmailReminderUnix === 0) {
          Cookie.set('verify_email_reminder_unix', nowPlusShowAgainTime);
          return;
        }

        if (now > verifyEmailReminderUnix) {
          this.dialog = true;
          Cookie.set('verify_email_reminder_unix', nowPlusShowAgainTime);
        }
      },
      onCancel() {
        this.dialog = false;
      },
      async resendVerificationEmail() {
        this.$wait.start(this.$WAIT_FOR.AUTH.RESEND);
        try {
          await this.$auth.user.resendVerificationEmail();
          this.$flash.success(this.$t('message.success.resendVerificationLink', {
            email: this.$auth.user.email,
          }));
        } catch ({ response }) {
          if (response.status === 429) {
            this.$flash.error(this.$t('message.general.tooManyAttempts'));
          } else {
            this.$flash.error(this.$t('message.error.resendVerificationLink', {
              email: this.$auth.user.email,
            }));
          }
        } finally {
          this.$wait.end(this.$WAIT_FOR.AUTH.RESEND);
        }
      }
    },
  };
</script>

<style scoped>

</style>
