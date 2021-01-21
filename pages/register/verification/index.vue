<template>
  <v-card flat>
    <v-card-text class="pa-0">
      <h2 class="mb-4">
        <span v-if="verified">{{ $t('register.verification.successHeading') }}</span>
        <span
          v-else
          class="error--text"
        >{{ $t('register.verification.errorHeading') }}</span>
      </h2>
      <template v-if="verified">
        <p class="subheading">
          {{ $t('register.verification.successSubheading') }}
        </p>
        <p class="subheading">
          {{ $t('register.verification.successBody') }}
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
      </template>

      <template v-else>
        <p class="subheading">
          {{ $t('register.verification.errorSubheading') }}
        </p>
        <p class="subheading mb-1">
          {{ $t('register.verification.errorBody') }}
        </p>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapState, mapMutations } from 'vuex';

  export default {
    layout: 'public',
    beforeMount() {
      const { email, verified } = this.$route.query;
      this.email = email;
      this.verified = verified === 'true';
    },
    computed: {
      ...mapState('register', {
        _email: 'email',
        _verified: 'verified',
      }),
      email: {
        get() {
          return this._email;
        },
        set(value) {
          return this.$store.commit('register/setEmail', value);
        }
      },
      verified: {
        get() {
          return this._verified;
        },
        set(value) {
          return this.$store.commit('register/setVerified', value);
        }
      }
    },
    methods: {
      ...mapMutations('register', ['setEmail', 'setVerified']),
      goToLogin() {
        this.$router.push(`/auth/${this.email}`);
      },
    },
  };
</script>
