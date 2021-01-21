<template>
  <v-card flat>
    <v-card-text class="pa-0">
      <p class="subheading">
        {{ $t('auth.passwordResetSuccess') }}
      </p>
      <v-btn
        class="ml-0"
        color="success"
        dark
        large
        @click="goToLogin"
      >
        {{ $t('button.logIn') }}
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    layout: 'public-guest',
    data() {
      return {
        email: null,
      };
    },
    beforeMount() {
      const { email } = this.$route.query;
      this.email = email;
    },
    methods: {
      goToLogin() {
        this.$router.push(`/auth/${this.email}`);
      },
    },
  };
</script>
