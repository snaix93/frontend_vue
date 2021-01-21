<template>
  <v-dialog
    persistent
    lazy
    :value="dialog"
    max-width="960px"
  >
    <v-card>
      <v-card-title class="py-2 grey lighten-3 align-baseline">
        <span class="headline mr-2">{{ charts[0].label | capitalize }}</span>
        <span class="subheading">
          {{ host.name | capitalize }}
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
        <div class="pa-1">
          <MeasurementsCharts
            v-if="dialog"
            :timezone="timezone"
            :charts="charts"
            :default-from="chart_chartDefaultFrom"
            :default-to="chart_chartDefaultTo"
            :host="host"
            :actions="[]"
            overwrite-view="list"
          />
        </div>
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
  import MeasurementsCharts from '@/components/Hosts/Measurements/MeasurementsCharts';

  import chartMixins from '@/mixins/chart';

  export default {
    components: {
      MeasurementsCharts,
    },
    mixins: [chartMixins],
    props: {
      host: {
        type: Object,
        required: true,
      },
      charts: {
        type: Array,
        required: true,
      },
    },
    computed: {
      dialog() {
        return this.$store.getters['dashboard/focusChartsDialog'];
      },
      timezone() {
        return this.$auth.team.timezone;
      },
    },
    beforeMount() {
      this.chart_setChartPeriodDefaults();
    },
    methods: {
      onCancel() {
        this.$store.commit('dashboard/hideFocusChartsDialog');
        this.chart_setChartPeriodDefaults();
      },
    },
  };
</script>
