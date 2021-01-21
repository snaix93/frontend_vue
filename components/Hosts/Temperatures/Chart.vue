<template>
  <div class="temperatures-chart">
    <v-layout
      v-if="!!renderChart"
      column
      justify-space-between
    >
      <Legend
        v-if="chart"
        ref="legend"
        :chart="chart"
        :chart-data="chartData"
        :chart-options="chartOptions"
        :view="view"
      />
      <LineChart
        class="temperatures-chart--chart"
        :chart-data="chartData"
        :chart-options="chartOptions"
        :styles="chartStyles"
        time-based
        @render="onRender"
      />
      <v-flex xs12>
        <v-layout
          row
          align-center
          justify-space-between
        >
          <span class="temperature-chart--name body-2 ml-4">
            {{ value.sensor_name }}
          </span>
          <v-chip
            :color="color"
            class="ma-0"
            text-color="white"
            label
            small
          >
            <v-icon left>
              {{ icon }}
            </v-icon>
            {{ $t(`host.temperatures.states.${state}`) | capitalize }}
          </v-chip>
        </v-layout>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
  import useDateTime from '@/mixins/useDateTime';

  import Legend from '@/components/Plugins/Chart/Legend';
  import LineChart from '@/components/Plugins/Chart/LineChart';

  export default {
    components: { Legend, LineChart },
    mixins: [useDateTime],
    props: {
      value: {
        type: Object,
        required: true,
      },
      height: {
        type: String,
        required: false,
        default: '45vh',
      },
      view: {
        type: String,
        required: false,
        default: 'grid',
      },
    },
    data() {
      const colors = {
        critical: '#ef5350',
        warm: '#ffd74e',
        ok: '#81c784',
        cold: '#1976d2',
      };

      return {
        chart: null,
        colors,
        renderChart: false,
        chartData: {
          datasets: [],
        },
      };
    },
    computed: {
      base() {
        return this.value.critical_threshold / 2;
      },
      state() {
        let result;

        if (this.value.critical_threshold === 0) {
          result = 'ok';
        } else if (this.value.temperature >= (this.base * 4)) {
          result = 'critical';
        } else if (this.value.temperature >= (this.base * 3)) {
          result = 'warm';
        } else if (this.value.temperature >= (this.base * 2)) {
          result = 'ok';
        } else {
          result = 'cold';
        }

        return result;
      },
      color() {
        let result;

        switch (this.state) {
          case 'critical':
            result = this.colors.critical;
            break;
          case 'warm':
            result = this.colors.warm;
            break;
          case 'ok':
            result = this.colors.ok;
            break;
          default:
            result = this.colors.cold;
        }

        return result;
      },
      icon() {
        let result;

        switch (this.state) {
          case 'critical':
            result = 'whatshot';
            break;
          case 'warm':
            result = 'warning';
            break;
          case 'ok':
            result = 'done';
            break;
          default:
            result = 'ac_unit';
        }

        return result;
      },
      chartOptions() {
        return {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                stepSize: this.base,
                suggestedMax: this.value.critical_threshold,
              },
              gridLines: {
                drawBorder: false,
                lineWidth: 1,
                borderDash: [2],
                color: [
                  this.colors.critical,
                  this.colors.warm,
                  this.colors.ok,
                  this.colors.cold,
                ],
              },
            }],
          },
        };
      },
      chartStyles() {
        return {
          width: '100%',
          height: this.height,
          position: 'relative',
        };
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.chartData.datasets = this.value.data.map((set) => {
          const input = set.data;
          const data = input.map(item => ({
            x: this.parseTimestampAsMomentObj(
              item.x,
              this.$auth.team.timezone,
            ),
            y: item.y,
          }));

          let { color } = this;
          let backgroundColor = `${color}66`;

          if (set.label.includes('critical threshold')) {
            color = this.colors.critical;
            backgroundColor = 'rgba(0,0,0,0)';
          }

          return {
            label: set.label,
            borderWidth: 1.8,
            pointRadius: 0,
            lineTension: 0,
            backgroundColor,
            borderColor: color,
            pointBorderColor: color,
            pointBackgroundColor: color,
            hidden: false,
            data,
          };
        });

        this.renderChart = true;
      });
    },
    methods: {
      onRender(chart) {
        this.chart = chart;
      },
    },
  };
</script>
