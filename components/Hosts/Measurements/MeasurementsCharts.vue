<template>
  <v-layout column>
    <v-layout
      v-if="!!actions.length"
      row
      wrap
      justify-space-between
    >
      <v-flex
        xs10
        sm8
      >
        <template v-if="actions.indexOf('datepicker') !== -1">
          <v-layout
            row
            wrap
          >
            <v-flex class="pr-1">
              <v-menu
                ref="menu1"
                v-model="fromDateMenu"
                :close-on-content-click="false"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                max-width="300px"
                min-width="300px"
                class="datetimepickers"
              >
                <v-text-field
                  slot="activator"
                  v-model="dates.from"
                  :label="$t('charts.from') | capitalize"
                  persistent-hint
                  hide-details
                  readonly
                />
                <date-pick
                  v-model="dates.from"
                  class="d-block"
                  :has-input-element="false"
                  :pick-time="true"
                  :format="'YYYY-MM-DD HH:mm'"
                  :is-date-disabled="disableFromDates"
                />
              </v-menu>
            </v-flex>
            <v-flex class="px-1">
              <v-menu
                ref="menu2"
                v-model="toDateMenu"
                :close-on-content-click="false"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                max-width="300px"
                min-width="300px"
                class="datetimepickers"
              >
                <v-text-field
                  slot="activator"
                  v-model="dates.to"
                  :label="$t('charts.to') | capitalize"
                  persistent-hint
                  hide-details
                  readonly
                />
                <date-pick
                  v-model="dates.to"
                  class="d-block"
                  :has-input-element="false"
                  :pick-time="true"
                  :format="'YYYY-MM-DD HH:mm'"
                  :is-date-disabled="disableToDates"
                />
              </v-menu>
            </v-flex>
            <v-flex class="caption grey--text text--darken-1 py-2">
              {{ $t('charts.dataRetentionMessage', { num: dataRetention }) }}
            </v-flex>
          </v-layout>
        </template>
      </v-flex>
      <v-flex
        :xs12="!!$vuetify.breakpoint.smAndDown"
        shrink
        class="text-right"
        :class="{
          'mt-3' : !!$vuetify.breakpoint.smAndDown
        }"
      >
        <v-layout
          row
          align-center
          wrap
        >
          <v-btn
            v-if="actions.indexOf('print') !== -1"
            icon
            class="shrink my-0"
            @click="onPrintClick"
          >
            <v-icon>print</v-icon>
          </v-btn>
          <v-btn-toggle
            v-if="actions.indexOf('view') !== -1"
            v-model="view"
            class="grow"
            mandatory
            @change="onViewChange"
          >
            <v-btn
              value="col3"
              flat
            >
              <v-icon>view_column</v-icon>
            </v-btn>
            <v-btn
              value="col2"
              flat
            >
              <v-icon>border_all</v-icon>
            </v-btn>
            <v-btn
              value="list"
              flat
            >
              <v-icon>view_stream</v-icon>
            </v-btn>
          </v-btn-toggle>
          <v-select
            v-if="actions.indexOf('period') !== -1"
            v-model="period"
            class="shrink my-0"
            :label="$tc('phrase.period', 1) | capitalize"
            :items="periods"
            item-value="value"
            item-text="text"
            @change="onPeriodSelect"
          />
        </v-layout>
      </v-flex>
    </v-layout>
    <v-layout
      row
      wrap
    >
      <v-flex
        v-for="chart in processedCharts"
        :key="chart.endpoint"
        :class="chartColClass + ' pa-0 qa-graph-' + chart.endpoint"
      >
        <template v-if="Host && dates.from && dates.to">
          <v-chip
            v-if="!!chart.name"
            color="primary"
            class="ma-0"
            text-color="white"
            label
            small
          >
            {{ chart.name | capitalize }}
          </v-chip>
          <Chart
            v-if="!chart.isTextBased"
            :host-id="Host.id"
            :endpoint="chart.endpoint"
            :db="chart.db"
            :period-start="timestampFrom"
            :period-end="timestampTo"
            :height="chartHeight"
            :print-chart="printChart"
            :chart-options="chart.options"
            :params="chart.params"
            :dataset-options="chart.dataset"
            :single-key="chart.singleKey"
            :view="view"
            :batch="!!chart.batch"
            :group="chart.group"
            :hide-legend="hideLegend"
            :class="{
              'mt-3' : !chart.name,
              'mt-2' : !!chart.name
            }"
            class="mr-1"
          />
          <TextValuesTable
            v-else
            :host-id="Host.id"
            :endpoint="chart.endpoint"
            :db="chart.db"
            :single-key="chart.singleKey"
            :period-start="timestampFrom"
            :period-end="timestampTo"
            :class="{
              'mt-3' : !chart.name,
              'mt-2' : !!chart.name
            }"
          />
        </template>
      </v-flex>
    </v-layout>
    <portal
      to="charts-print-output-header"
      :order="1"
    >
      <h2 class="title">
        {{ Host.name }}
      </h2>
      <p>{{ dates.from }} - {{ dates.to }}</p>
    </portal>
  </v-layout>
</template>

<script>
  import DatePick from 'vue-date-pick';
  import 'vue-date-pick/dist/vueDatePick.css';

  import Chart from '@/components/Hosts/Measurements/Chart';
  import TextValuesTable from '@/components/Hosts/Measurements/TextValuesTable';

  import hyperVMetricsMixins from '@/mixins/hyperVMetrics';
  import chartMixins from '@/mixins/chart';
  import chartSectionMixins from '@/mixins/chartSection';

  export default {
    layout: 'admin',
    components: {
      DatePick,
      Chart,
      TextValuesTable,
    },
    mixins: [
      hyperVMetricsMixins,
      chartMixins,
      chartSectionMixins,
    ],
    props: {
      Host: {
        type: Object,
        required: true,
      },
      charts: {
        type: Array,
        required: true,
      },
      timezone: {
        type: String,
        required: true,
      },
      defaultFrom: {
        type: Number,
        required: true,
      },
      defaultTo: {
        type: Number,
        required: true,
      },
      append: {
        type: Array,
        required: false,
        default() {
          return [];
        },
      },
      actions: {
        type: Array,
        required: false,
        default() {
          return ['datepicker', 'print', 'view'];
        },
      },
      overwriteView: {
        type: String,
        required: false,
      },
      quickView: {
        type: Boolean,
        required: false,
        default: false,
      },
      hideLegend: {
        type: Boolean,
        required: false,
        default: false,
      },
      syncCharts: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    data() {
      return {
        view: this.overwriteView || 'col3',
        chartHeight: '',
        chartHeightFlat: '11vh',
        chartHeightXs: '21vh',
        chartHeightSm: '30vh',
        chartHeightLg: '45vh',
        printChart: false,
        showTextValuesTable: false,
        period: null,
        periods: [
          {
            text: this.$t('charts.periods.sixHours'),
            value: 6*60,
          },
          {
            text: this.$t('charts.periods.twentyFourHours'),
            value: 24*60,
          },
          {
            text: this.$t('charts.periods.sevenDays'),
            value: 7*24*60,
          },
          {
            text: this.$t('charts.periods.thirtyDays'),
            value: 30*24*60,
          }
        ]
      };
    },
    computed: {
      processedCharts() {
        const freeSpaceColoring = [
          {
            backgroundColor: 'rgba(44, 160, 44, 0.2)',
            borderColor: 'rgb(44, 160, 44)',
            pointBackgroundColor: 'rgba(44, 160, 44, 0.2)',
            pointBorderColor: 'rgb(44, 160, 44)',
            fill: true,
          },
          {
            backgroundColor: 'rgba(255, 127, 14, 0.2)',
            borderColor: 'rgb(255, 127, 14)',
            pointBackgroundColor: 'rgba(255, 127, 14, 0.2)',
            pointBorderColor: 'rgb(255, 127, 14)',
          },
          {
            backgroundColor: 'rgba(31, 119, 180, 0.2)',
            borderColor: 'rgb(31, 119, 180)',
            pointBackgroundColor: 'rgba(31, 119, 180, 0.2)',
            pointBorderColor: 'rgb(31, 119, 180)',
          },
        ];

        return this.charts.map((chart) => {
          chart.isTextBased = chart.endpoint ? this.chart_isTextBased(chart.endpoint) : false;

          if(this.append && this.append.length) {
            chart.params = {
              append: this.append.toString()
            }
          } else {
            chart.params = null;
          }

          if (chart.dataset && chart.dataset.single === 'freeSpaceColoring') {
            chart.dataset.single = freeSpaceColoring;
          }

          if(this.syncCharts)
            chart.options.plugins = {
              crosshair: {
                sync: {
                  enabled: true,            // enable trace line syncing with other charts
                  group: 1,                 // chart group
                  suppressTooltips: false
                },
              }
            }

          return chart;
        });
      },
    },
    mounted() {
      if(this.actions.indexOf('period') !== -1) {
        const minutesAgo = (this.timestampTo - this.timestampFrom) / 60;

        // https://stackoverflow.com/questions/8584902/get-closest-number-out-of-array
        const currentPeriod = this.periods.reduce(function(prev, curr) {
          return (Math.abs(curr.value - minutesAgo) < Math.abs(prev.value - minutesAgo) ? curr : prev);
        });

        this.period = currentPeriod;
      }
    },
    methods: {
      onViewChange(view) {
        this.toggleChartHeight(view);
        this.$store.commit('hosts/setMeasurementsPrintView', view);
      },
      onPrintClick() {
        if (process.client) {
          this.printChart = true;
          window.onafterprint = () => { this.printChart = false; };
          setTimeout(() => {
            window.print();
          }, 300);
        }
      },
      async onPeriodSelect(period) {
        this.dates.from = this.setDate(this.timestampTo - period * 60);
      }
    },
  };
</script>
