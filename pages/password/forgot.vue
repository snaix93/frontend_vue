<template>
  <v-card flat>
    <v-card-text class="pa-0">
      <h2 class="mb-4">
        {{ $t('auth.forgotPassword') | capitalize }}
      </h2>
      <ForgotPasswordForm>
        {{ $t('auth.forgotPassword') }}
      </ForgotPasswordForm>
    </v-card-text>
  </v-card>
</template>

<script>
  import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm';

  export default {
    layout: 'public-guest',
    components: {
      ForgotPasswordForm,
    },
  };
</script>
