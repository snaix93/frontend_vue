<template>
  <v-card flat>
    <v-card-text class="pa-0">
      <h2>
        {{ $t('auth.login') | capitalize }}
      </h2>
      <p class="mt-2 mb-4 caption">
        <span class="text--secondary">{{ $t('auth.notRegistered') }}</span>
        <a
          class="secondary--text font-weight-bold no-text-decoration"
          href="/register"
        >
          {{ $t('button.freeTrial') }}
        </a>
      </p>
      <AuthForm :prefilled-email="email">
        {{ $t('auth.logIn') }}
      </AuthForm>
      <p class="mt-3">
        <nuxt-link
          class="secondary--text no-text-decoration font-weight-bold caption"
          to="/password/forgot"
        >
          {{ $t('auth.forgotYourPassword') }}
        </nuxt-link>
      </p>
    </v-card-text>
  </v-card>
</template>

<script>
  import AuthForm from '@/components/Auth/AuthForm';

  export default {
    layout: 'public-guest',
    components: {
      AuthForm,
    },
    data() {
      return {
        email: '',
      };
    },
    beforeMount() {
      const { email } = this.$route.params;
      if (email && /\S+@\S+\.\S+/.test(email)) {
        this.email = email.trim();
      }
    },
  };
</script>
