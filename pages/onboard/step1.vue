<template>
  <v-layout wrap>
    <v-flex class="position-relative" style="min-height:320px;" xs12>
      <v-fade-transition mode="out-in">
        <v-flex v-if="!$fetchState.pending">
          <v-sheet
            class="d-flex"
            color="secondary lighten-4 mb-4 pa-2"
            elevation="1"
          >
            <h2 class="body-2">
              {{ $t('onboarding.step1.header') }}
            </h2>
          </v-sheet>
          <OnboardingStep1Form
            :frontmen="publicFrontmen"
            :regions="estimatedRegionsOptions"
            :settings="settings"
            :timezones="timezones"
          />
        </v-flex>
      </v-fade-transition>

      <AppWait :wait="$fetchState.pending" height="100%"/>
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import OnboardingStep1Form from '@/components/Onboard/OnboardingStep1Form';
  import AppWait from '@/components/App/AppWait';

  export default {
    components: { AppWait, OnboardingStep1Form },
    async fetch() {
      await this.getTimezones();
      await this.getPublicFrontmen();
      await this.getUserEstimatedRegion();
    },
    computed: {
      ...mapState('refData', ['timezones', 'publicFrontmen']),
      ...mapState('user', ['userEstimatedRegion']),
      estimatedRegion() {
        return this.userEstimatedRegion;
      },
      estimatedDateFormat() {
        let dateFormat = '';
        if (this.estimatedMainTimezone
            && this.estimatedMainTimezone.hasOwnProperty('dateFormat')
            && this.estimatedRegion) {
          dateFormat = this.estimatedMainTimezone.dateFormat[this.estimatedRegion];
        }

        return dateFormat;
      },
      estimatedMainTimezone() {
        return this.timezones.filter(({ utc }) => utc.indexOf(this.estimatedRegion) > -1)[0];
      },
      estimatedRegionsOptions() {
        let regions = [];
        if (this.estimatedMainTimezone && this.estimatedRegion) {
          regions = this.estimatedMainTimezone.utc;
        }
        return regions;
      },
      settings() {
        const mainTimezone = this.estimatedMainTimezone?.value ?? '';
        const timezone = this.estimatedRegion ?? '';
        const dateFormat = this.estimatedDateFormat;
        const defaultFrontman = this.estimatedMainTimezone?.frontmanUuid ?? '';

        return { mainTimezone, timezone, dateFormat, defaultFrontman };
      },
    },
    methods: {
      ...mapActions('refData', ['getPublicFrontmen', 'getTimezones']),
      ...mapActions('user', ['getUserEstimatedRegion']),
    },
  };
</script>

<style scoped lang="stylus">
  * {
    transition-delay: 250ms;
  }
</style>
