<template>
  <v-layout wrap>
    <v-flex xs12>
      <v-sheet
        class="d-flex"
        color="secondary lighten-4 mb-4 pa-2"
        elevation="1"
      >
        <h2 class="body-2">
          {{ $t('onboarding.step2.header') }}
        </h2>
      </v-sheet>

      <OnboardingStep2Form/>

    </v-flex>
  </v-layout>
</template>

<script>
  import OnboardingStep2Form from '@/components/Onboard/OnboardingStep2Form';

  export default {
    components: {
      OnboardingStep2Form,
    },
    created() {
      this.$wait.end(this.$WAIT_FOR.ONBOARD.SAVE);
    }
  };
</script>

<style lang="stylus" scoped>
</style>
