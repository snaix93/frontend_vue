<template>
  <v-card flat>
    <v-fade-transition mode="out-in">
      <v-card-text
        v-if="!success"
        key="form"
        class="pa-0"
      >
        <h2>
          {{ $t('register.joinTeam') | capitalize }}
        </h2>
        <p class="mt-2 mb-4 caption text--secondary">
          {{ $t('register.pleaseFillOutTheFormBelow') | capitalize }}
        </p>
        <JoinTeamForm @on-success="onSuccess">
          {{ $t('register.joinTeam') | capitalize }}
        </JoinTeamForm>
      </v-card-text>
      <v-card-text
        v-else
        key="submitted"
        class="pa-0"
      >
        <v-layout row>
          <v-flex
            mr-3
            shrink
          >
            <SuccessIcon/>
          </v-flex>
          <h2>
            {{ $t('register.yourAccountHasBeenCreated') | capitalize }}
          </h2>
        </v-layout>

        <p class="mt-4 mb-4 text--secondary">
          {{ $t('register.youCanNowLogIn') | capitalize }}
        </p>
        <v-btn
          class="ml-0"
          color="success"
          large
          @click="goToLogin"
        >
          {{ $t('register.goToLogin') | capitalize }}
        </v-btn>
      </v-card-text>
    </v-fade-transition>
  </v-card>
</template>

<script>
  import JoinTeamForm from '@/components/Auth/JoinTeamForm';
  import SuccessIcon from '@/components/App/SuccessIcon';

  export default {
    layout: 'public-guest',
    components: {
      SuccessIcon,
      JoinTeamForm,
    },
    data() {
      return {
        email: null,
        success: false,
      };
    },
    beforeMount() {
      const { email } = this.$route.params;
      this.email = email;
    },
    methods: {
      onSuccess() {
        this.success = true;
      },
      goToLogin() {
        this.$router.push(`/auth/${this.email}`);
      },
    },
  };
</script>
