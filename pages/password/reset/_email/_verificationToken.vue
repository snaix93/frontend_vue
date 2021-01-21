<template>
  <v-card flat>
    <v-card-text class="pa-0">
      <h2 class="mb-4">
        {{ $t('auth.resetPassword') | capitalize }}
      </h2>
      <PasswordResetForm>
        {{ $t('auth.resetPassword') }}
      </PasswordResetForm>
    </v-card-text>
  </v-card>
</template>

<script>
  import PasswordResetForm from '@/components/Auth/PasswordResetForm';

  export default {
    layout: 'public-guest',
    components: {
      PasswordResetForm,
    },
  };
</script>
