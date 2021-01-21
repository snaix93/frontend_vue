<template>
  <v-dialog
    :max-width="chartIsTextBased ? '1200px' : '960px'"
    :value="dialog"
    persistent
  >
    <v-card>
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ selectedMeasurement.name }}
        </span>
        <v-spacer/>
        <v-btn
          icon
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider/>
      <v-card-text>
        <v-layout
          row
          wrap
        >
          <MeasurementsCharts
            v-if="dialog"
            :Host="Host"
            :actions="['datepicker']"
            :append="append"
            :charts="charts"
            :default-from="chart_chartDefaultFrom"
            :default-to="chart_chartDefaultTo"
            :timezone="timezone"
            overwrite-view="full-without-margin"
            @on-update-duration="onUpdateDuration"
          />
        </v-layout>
      </v-card-text>
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          color="primary"
          flat
          @click="onCancel"
        >
          {{ $t('button.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import MeasurementsCharts from '@/components/Hosts/Measurements/MeasurementsCharts';

  import chartMixins from '@/mixins/chart';

  export default {
    components: {
      MeasurementsCharts,
    },
    mixins: [chartMixins],
    props: {
      charts: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        append: null,
      };
    },
    computed: {
      ...mapState('hosts', {
        dialog: 'graphDialog',
      }),
      ...mapState('hosts', ['Host', 'selectedMeasurement']),
      timezone() {
        return this.$auth.user.team.timezone;
      },
      chartIsTextBased() {
        if (! this.charts.length) return false;
        return this.chart_isTextBased(this.charts[0].endpoint);
      }
    },
    beforeMount() {
      this.chart_setChartPeriodDefaults();
    },
    methods: {
      ...mapMutations('hosts', ['toggleGraphDialog']),
      onUpdateDuration(durationAsHours) {
        if (durationAsHours > 1) {
          this.append = ['min', 'max'];
        } else {
          this.append = null;
        }
      },
      onCancel() {
        this.toggleGraphDialog();
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .v-card__title
    flex-wrap: nowrap
</style>
