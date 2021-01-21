<template>
  <v-container fluid>
    <v-layout align-center wrap>
      <v-flex>
        <v-card flat>
          <v-card-text class="pt-0 text-xs-center">
            <h3 class="headline">
              {{ $t('onboarding.completeUserSettingsSuccess') }}...
            </h3>
            <v-progress-linear
              v-model="redirectToDashboardCountdown"
              height="15"
            />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    data() {
      return {
        redirectToDashboardCountdown: 0,
      };
    },
    created() {
      this.triggerRedirectToDashboardCountdown();
    },
    methods: {
      triggerRedirectToDashboardCountdown() {
        this.$nextTick(() => {
          setInterval(() => {
            this.redirectToDashboardCountdown += 4;
          }, 100);
          setTimeout(() => {
            this.$router.push('/dashboard/hosts');
          }, 2500);
        });
      },
    }
  };
</script>

<style scoped>

</style>
