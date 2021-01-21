<template>
  <v-alert
    :value="$auth.user.isAdmin() && !$auth.user.emailVerified"
    class="mb-3"
    type="warning"
  >
    <v-layout align-center>
      <v-flex class="subheading">
        <slot/>
      </v-flex>
      <v-spacer/>
      <ThrottledButton
        :loading="$wait.is($WAIT_FOR.AUTH.RESEND)"
        :outline="true"
        :small="true"
        color="white"
        urls="auth/verify/resend"
        @click="resendVerificationEmail"
      >
        {{ $t('phrase.resend') | capitalize }}
      </ThrottledButton>
    </v-layout>
  </v-alert>
</template>

<script>
  import ThrottledButton from '@/components/App/ThrottledButton';

  export default {
    name: 'ResendVerificationEmailAlert',
    components: { ThrottledButton },
    methods: {
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
