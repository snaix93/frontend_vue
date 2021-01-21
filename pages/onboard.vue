<template>
  <v-layout justify-center>
    <v-flex lg8 md12>
      <v-card>
        <v-toolbar color="secondary" dark>
          <v-toolbar-title>
            {{ $t('onboarding.headerMain') }}
          </v-toolbar-title>
          <v-spacer/>
          <v-toolbar-items>
            <v-layout align-center>
              <v-flex v-if="step <= totalSteps">
                <v-chip color="primary" text-color="white">
                  Step {{ step }} of {{ totalSteps }}
                </v-chip>
              </v-flex>
            </v-layout>
          </v-toolbar-items>
        </v-toolbar>

        <v-container fluid>
          <NuxtChild/>
        </v-container>

      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapActions, mapMutations } from 'vuex';

  export default {
    layout: 'onboarding',
    data() {
      return {
        step: 1,
        totalSteps: 2,
      };
    },
    computed: {
      step1Complete() {
        return this.$auth.user.hasCompletedTeamSettings();
      },
      step2Complete() {
        return this.$auth.team.onboarded;
      },
      onboardingComplete() {
        return this.$auth.team.onboarded;
      },
    },
    created() {
      if (this.onboardingComplete) {
        return this.$router.push(`/onboard/final`);
      }
      if (this.$route.matched.length === 1) {
        this.$router.push(`/onboard/step1`);
      }
      if (this.step1Complete) {
        this.step = 2;
        this.$router.push(`/onboard/step2`);
      }
    },
    watch: {
      step1Complete() {
        this.proceedToNextStep();
      },
      step2Complete() {
        this.proceedToNextStep();
      },
    },
    methods: {
      ...mapMutations('dashboard', ['toggleWebCheckWizardDialog']),
      ...mapActions('refData', ['getPublicFrontmen', 'getTimezones']),
      ...mapActions('user', ['getUserEstimatedRegion']),
      proceedToNextStep() {
        this.step++;
        if (this.step > this.totalSteps) {
          this.$router.push('/onboard/final');
        } else {
          this.$router.push(`/onboard/step${this.step}`);
        }
      },
    },
  };
</script>

<style scoped>

</style>
