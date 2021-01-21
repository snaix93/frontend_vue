<template>
  <v-layout column>
    <v-layout
      row
      justify-space-between
    >
      <v-flex
        xs10
        sm8
      >
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
      </v-flex>
      <v-flex
        shrink
        class="d-inline-flex align-start text-right"
      >
        <v-btn-toggle
          v-model="view"
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
      </v-flex>
    </v-layout>
    <v-layout
      row
      wrap
      class="mt-3"
    >
      <template v-if="renderChart">
        <v-flex
          v-for="(dataset, i) in chartData"
          :key="i"
          :class="chartColClass + ' mb-4 py-0 px-1'"
        >
          <Chart
            :height="chartHeight"
            :value="dataset"
            :view="view"
          />
        </v-flex>
      </template>
      <v-flex
        v-else-if="loadingError"
        xs12
      >
        <v-alert
          :value="loadingError"
          type="error"
          outline
          class="v-alert--light"
        >
          {{ errorMessage }}
        </v-alert>
      </v-flex>
      <v-flex
        v-else-if="!hasData"
        xs12
      >
        <NoDataMessage />
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>

  import DatePick from 'vue-date-pick';
  import 'vue-date-pick/dist/vueDatePick.css';

  import Chart from '@/components/Hosts/Temperatures/Chart';
  import NoDataMessage from '@/components/Hosts/Measurements/NoDataMessage';

  import chartSectionMixins from '@/mixins/chartSection';

  export default {
    layout: 'admin',
    components: {
      Chart,
      DatePick,
      NoDataMessage,
    },
    mixins: [chartSectionMixins],
    props: {
      Host: {
        type: Object,
        required: true,
      },
      temperatures: {
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
    },
    data() {
      return {
        view: this.overwriteView || 'col3',
        chartData: {},
        chartHeight: '',
        chartHeightXs: '20vh',
        chartHeightSm: '25vh',
        chartHeightLg: '30vh',
        loadingError: false,
        errorMessage: this.$tc('message.error.graphLoad', 2),
        hasData: false,
        renderChart: false,
        waitKey: 'host.graph-data.temperatures',
      };
    },
    watch: {
      'dates.from': function (newVal, oldVal) {
        if (oldVal) this.getGraph();
      },
      'dates.to': function (newVal, oldVal) {
        if (oldVal) this.getGraph();
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.getGraph();
      });
    },
    methods: {
      async getGraph() {
        this.renderChart = false;
        this.hasData = true;

        this.$store.dispatch('wait/start', this.waitKey);

        const params = {
          from: this.timestampFrom,
          to: this.timestampTo,
        };

        try {
          const response = await this.$store.dispatch('hostCharts/get', {
            singleKey: false,
            endpoint: 'temperature',
            hostId: this.Host.id,
            params,
          });

          if (response?.length) {
            const chartDataBySensor = {};

            response.forEach((dataset) => {

              let [, key] = dataset.label.match(/(.+) (critical threshold|temperature) temp$/i);

              key = key.replace(/^S M A R T :/i, 'S.M.A.R.T.:')
                       .replace(' ', '_');

              if (!chartDataBySensor[key]) chartDataBySensor[key] = [];

              chartDataBySensor[key].push(dataset);
            });

            this.chartData = this.temperatures.map((temperature) => {
              const keyed_sensor_name = temperature.sensor_name.replace(' ', '_');
              temperature.data = chartDataBySensor[keyed_sensor_name];

              // Remove critical threshold dataset
              // if temperature has no critical threshold
              if (temperature.critical_threshold === 0) {
                temperature.data = temperature.data.filter(
                  ({ label }) => !label.match(/(.+) (critical threshold) temp$/i),
                );
              }

              return temperature;
            });

            this.renderChart = true;
          } else {
            this.hasData = false;
          }

          this.reset();
        } catch (e) {
          console.error(e);
          this.error();
        }
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
    },
  };
</script>
