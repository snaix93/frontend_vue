<template>
  <v-dialog
    scrollable
    persistent
    lazy
    :value="dialog"
    max-width="900px"
  >
    <v-card v-if="dialog && host">
      <v-card-title class="py-0 px-2 grey lighten-3">
        <span class="subheading">{{ host.name }}</span>
        <v-spacer/>
        <v-btn
          icon
          small
          @click="onCancel"
        >
          <v-icon small>
            clear
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-divider/>
      <v-card-text
        v-if="showCharts"
        class="pt-4 px-4"
      >
        <MeasurementsCharts
          :timezone="timezone"
          :charts="chart_quickCharts"
          :default-from="chart_quickChartDefaultFrom"
          :default-to="chart_chartDefaultTo"
          :host="host"
          :actions="['period']"
          overwrite-view="full-narrow"
          hide-legend
          sync-charts
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import MeasurementsCharts from '@/components/Hosts/Measurements/MeasurementsCharts';
  import chartMixins from '@/mixins/chart';

  export default {
    components: { MeasurementsCharts },
    mixins: [chartMixins],
    props: {
      host: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        showCharts: false,
      };
    },
    computed: {
      ...mapState('dashboard', ['miniGraphDialog']),
      dialog() {
        return this.miniGraphDialog;
      },
      timezone() {
        return this.$auth.team.timezone;
      },
    },
    mounted() {
      this.chart_setChartPeriodDefaults(true);
      this.showCharts = true;
    },
    methods: {
      ...mapMutations('dashboard', ['toggleMiniGraphDialog']),
      onCancel() {
        this.toggleMiniGraphDialog();
      },
    },
  };
</script>
