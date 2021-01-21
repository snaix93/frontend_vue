<template>
  <v-layout
    v-if="hasData || !hideNoDataMessage"
    :fill-height="fillHeight"
    column
  >
    <v-layout
      v-if="hasData"
      :fill-height="fillHeight"
      justify-center
      row
    >
      <v-flex
        v-if="requestCanceled"
        @click="reattemptToFetchGraphData"
      >
        <v-layout
          align-center
          justify-center
        >
          <v-flex
            class="text-xs-center grey lighten-4"
            px-2
          >
            <p class="caption pa-0 ma-0 text-uppercase font-weight-bold">
              {{ $t('charts.timedOut') }}
            </p>
            <v-icon small>
              far fa-clock
            </v-icon>
            <p class="caption pa-0 ma-0">
              {{ $t('charts.clickToTryAgain') }}
            </p>
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex
        v-else-if="requestFailed"
      >
        <v-layout
          align-center
          justify-center
        >
          <v-flex
            class="text-xs-center grey lighten-4"
            px-2
          >
            <v-icon small>
              sms_failed
            </v-icon>
            <p
              class="caption pa-0 ma-0"
              v-html="$t('charts.graphLoadTextValuesNotTagged', {
                url: `${app_knowledgeBaseUrl}configuring-hosts/managing-checks/custom-checks`
              })"
            />
          </v-flex>
        </v-layout>
      </v-flex>
      <v-flex
        v-else-if="$wait.is(waitKey)"
        :style="containerStyle"
      >
        <div :style="[chartStyles]">
          <v-layout
            :fill-height="fillHeight"
            align-center
            justify-center
          >
            <v-progress-circular
              :size="20"
              :width="2"
              color="secondary"
              indeterminate
            />
          </v-layout>
        </div>
      </v-flex>
      <v-flex
        v-else
        :style="containerStyle"
        xs12
      >
        <v-alert
          v-if="loadingError"
          :value="loadingError"
          class="v-alert--light"
          outline
          type="error"
        >
          <div v-html="errorMessage"/>
        </v-alert>
        <v-layout
          v-if="renderChart"
          :fill-height="fillHeight"
          align-start
          column
          justify-end
        >
          <Legend
            v-if="chart && !customLegend && !hideLegend"
            ref="legend"
            :chart="chart"
            :chart-data="chartData"
            :chart-options="chartOptions"
            :view="view"
          />
          <LineChart
            :chart-data="chartData"
            :chart-options="chartOptions"
            :print-chart="printChart"
            :style="chartStyles"
            time-based
            @render="onRender"
            @chart:print="handlePrint"
          />
        </v-layout>
        <div
          v-if="chart && customLegend"
          class="pt-1"
        >
          <slot name="legend-title"/>
          <span
            class="caption grey--text text--darken-1"
          >{{ lastDataPointValue }}
            <slot
              name="legend-unit"
            />
          </span>
        </div>
      </v-flex>
    </v-layout>

    <NoDataMessage
      v-if="!hasData && !hideNoDataMessage"
      :endpoint="endpoint"
    />
    <PrintOutputCol
      :order="1"
      to="charts-print-output"
    >
      <div
        v-if="hasData"
        v-html="printChartImg"
      />
    </PrintOutputCol>
  </v-layout>
</template>

<script>
  import appMixins from '@/mixins/app';
  import chartMixins from '@/mixins/chart';
  import useDateTime from '@/mixins/useDateTime';
  import PrintOutputCol from '@/components/Hosts/Measurements/PrintOutputCol';
  import NoDataMessage from '@/components/Hosts/Measurements/NoDataMessage';
  import LineChart from '@/components/Plugins/Chart/LineChart';
  import Legend from '@/components/Plugins/Chart/Legend';
  import ChartWorker from '@/workers/chart.worker.js';

  export default {
    components: {
      PrintOutputCol,
      NoDataMessage,
      LineChart,
      Legend,
    },
    mixins: [
      appMixins,
      chartMixins,
      useDateTime,
    ],
    props: {
      hostId: {
        type: String,
        required: true,
      },
      endpoint: {
        type: String,
        required: true,
      },
      db: {
        type: String,
        required: false,
      },
      singleKey: {
        type: Boolean,
        required: false,
        default: false,
      },
      periodStart: {
        type: Number,
        required: false,
      },
      periodEnd: {
        type: Number,
        required: false,
      },
      limit: {
        type: Number,
        required: false,
      },
      height: {
        type: String,
        required: false,
        default: '45vh',
      },
      fillHeight: {
        type: Boolean,
        required: false,
        default: true,
      },
      printChart: {
        type: Boolean,
        required: false,
        default: false,
      },
      chartOptions: {
        type: Object,
        required: false,
        default: null,
      },
      datasetOptions: {
        type: Object,
        required: false,
        default: null,
      },
      view: {
        type: String,
        required: false,
        default: 'grid',
      },
      group: {
        type: String,
        required: false,
      },
      batch: {
        type: Boolean,
        required: false,
        default: false,
      },
      batchMetricAlias: {
        type: Boolean,
        required: false,
        default: false,
      },
      hideNoDataMessage: {
        type: Boolean,
        required: false,
        default: false,
      },
      customLegend: {
        type: Boolean,
        required: false,
        default: false,
      },
      hideLegend: {
        type: Boolean,
        required: false,
        default: false,
      },
      containerStyle: {
        type: Object,
        required: false,
        default: null,
      },
      params: {
        type: Object,
        required: false,
        default: () => {
          return {};
        },
      },
    },
    data() {
      return {
        chartData: null,
        chart: null,
        lastDataPointValue: null,
        pointRadius: 0,
        loadingError: false,
        errorMessage: this.$tc('message.error.graphLoad', 1),
        printChartImg: null,
        renderChart: false,
        requestCanceled: false,
        requestFailed: false,
        hasData: true,
        selectedValues: [],
      };
    },
    computed: {
      waitKey() {
        if (this.group) {
          return `host.graph-data.${this.group}`;
        } else {
          return `host.graph-data.${this.singleKey
                                    ? `single.${this.hostId}.${this.endpoint}`
                                    : this.endpoint}`;
        }

      },
      chartStyles() {
        return {
          width: this.containerStyle ? this.containerStyle.width : '100%',
          height: this.height,
          position: 'relative',
        };
      },
    },
    watch: {
      endpoint() {
        this.getGraph(this.chart_processedParams);
      },
      periodStart() {
        this.getGraph(this.chart_processedParams);
      },
      periodEnd() {
        this.getGraph(this.chart_processedParams);
      },
      limit() {
        this.getGraph(this.chart_processedParams);
      },
    },
    created() {
      this.worker = new ChartWorker();
      // This needs to be left to this 10ms delay to ensure the batch
      // method runs first, if applicable.
      setTimeout(() => {
        this.getGraph(this.chart_processedParams);
      }, 10);
    },
    methods: {
      // handover _chart data to legend
      onRender(chart) {
        this.chart = chart;
      },
      reset() {
        this.loadingError = false;
        this.$store.dispatch('wait/end', this.waitKey);
      },
      error() {
        this.renderChart = false;
        this.loadingError = true;
        this.lastDataPointValue = null;
        this.$store.dispatch('wait/end', this.waitKey);
      },
      async getGraph(params) {
        this.reset();
        this.renderChart = false;
        this.hasData = true;
        this.requestCanceled = false;
        this.lastDataPointValue = null;

        this.$store.dispatch('wait/start', this.waitKey);

        try {
          const options = {
            singleKey: this.singleKey,
            endpoint: this.endpoint,
            hostId: this.hostId,
            params,
            db: this.db,
            batch: !! this.batch,
            batchMetricAlias: !! this.batchMetricAlias,
            quickView: !! this.quickView
          };

          if (!! this.group) {
            options.group = this.group;
          }

          const response = await this.$store.dispatch('hostCharts/get', options);

          this.worker.onmessage = ({ data: result }) => {
            this.hasData = result.hasData;
            this.renderChart = result.renderChart;
            this.chartData = {
              datasets: result.chartData.datasets,
            };

            let lastDataPointValue = result.lastDataPointValue;

            // Round to two decimals, if needed
            // https://stackoverflow.com/a/18358056
            if (! isNaN(lastDataPointValue)) {
              lastDataPointValue = +(Math.round(lastDataPointValue + 'e+2') + 'e-2');
            }

            this.lastDataPointValue = lastDataPointValue;
            this.reset();
          };

          this.worker.postMessage({
            response,
            pointRadius: this.pointRadius,
            datasetOptions: this.datasetOptions,
            teamTimezone: this.$auth.team.timezone,
            batch: !! this.batch
          });

        } catch (e) {
          if (e.message.timedOut || e.timedOut) {
            // This block will trigger if one of the graph requests times out.
            // This is registered in the axios plugin.
            this.requestCanceled = true;
          }

          if (e.response?.status && e.response.status === 400) {
            // Stop graph from rendering
            // if text values were not tagged correctly
            this.requestFailed = true;
          }

          if (e.response?.data?.error) {
            this.errorMessage = e.response.data.error;
          } else {
            this.errorMessage = this.$tc('message.error.graphLoad', 1);
          }

          this.error();
        }
      },
      handlePrint(image) {
        this.printChartImg = `<img src="${image}" alt="" />`;
      },
      async reattemptToFetchGraphData(event) {
        if (this.requestCanceled) {
          event.preventDefault();
          event.stopPropagation();
          // timed-out graph has been clicked so lets try it again
          await this.getGraph(this.chart_processedParams);
        }
      },
    },
  };
</script>
