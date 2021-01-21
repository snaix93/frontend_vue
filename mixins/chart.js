import filesize from 'filesize';

import useDateTime from '@/mixins/useDateTime';

export default {
  mixins: [useDateTime],
  data() {
    return {
      chart_quickChartDefaultFrom: null,
      chart_chartDefaultFrom: null,
      chart_chartDefaultTo: null,
    };
  },
  computed: {
    chart_processedParams() {
      let params = {};
      if (this.periodStart && this.periodEnd) {
        params.from = this.periodStart;
        params.to = this.periodEnd;
      }
      if (this.limit) {
        params.limit = this.limit;
      }
      if (this.params) {
        params = {
          ...params,
          ...this.params
        };
      }

      return params;
    },
    chart_quickCharts() {
      return [
        {
          name: this.$t('charts.diskIO'),
          endpoint: 'fs.total_read_B_per_s,fs.total_write_B_per_s',
          batch: true,
          options: {
            tooltips: {
              callbacks: {
                label: (tooltipItem, data) => `${
                  data.datasets[tooltipItem.datasetIndex].label
                }: ${this.chart_formatBytes(tooltipItem.yLabel)}`,
              },
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    callback: value => this.chart_formatBytes(value),
                  },
                },
              ],
            },
          },
          dataset: {
            global: {
              fill: false,
            },
          },
          group: 'quick-view',
        },
        {
          name: this.$t('charts.memoryUsed'),
          endpoint: 'mem.available_percent',
          db: this.CAGENT_DB_NAME,
          singleKey: true,
          options: {
            tooltips: {
              callbacks: {
                label: (tooltipItem, data) => `1${
                  data.datasets[tooltipItem.datasetIndex].label
                }: ${this.chart_formatPercent(tooltipItem.yLabel)}`,
              },
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    callback: value => this.chart_formatPercent(value),
                    min: 0,
                    max: 100,
                    stepSize: 20,
                  },
                },
              ],
            },
          },
          dataset: {
            global: {
              fill: false,
            },
          },
          group: 'quick-view',
        },
        {
          name: this.$t('charts.cpuUtilization'),
          endpoint: 'cpu.util.user.1.total,cpu.util.system.1.total',
          db: this.CAGENT_DB_NAME,
          batch: true,
          options: {
            tooltips: {
              callbacks: {
                label: (tooltipItem, data) => `${
                  data.datasets[tooltipItem.datasetIndex].label
                }: ${this.chart_formatPercent(tooltipItem.yLabel)}`,
              },
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    callback: value => this.chart_formatPercent(value),
                    min: 0,
                    max: 100,
                    stepSize: 20,
                  },
                },
              ],
            },
          },
          dataset: {
            global: {
              fill: false,
            },
          },
          group: 'quick-view',
        },
        {
          name: this.$t('charts.bandwidth'),
          endpoint: 'net.total_in_B_per_s,net.total_out_B_per_s',
          db: this.CAGENT_DB_NAME,
          batch: true,
          options: {
            tooltips: {
              callbacks: {
                label: (tooltipItem, data) => `${
                  data.datasets[tooltipItem.datasetIndex].label
                }: ${this.chart_formatBytes(tooltipItem.yLabel)}`,
              },
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    callback: value => this.chart_formatBytes(value),
                  },
                },
              ],
            },
          },
          dataset: {
            global: {
              fill: false,
            },
          },
          group: 'quick-view',
        },
      ];
    },
    CAGENT_DB_NAME: () => 'cagent',
    CUSTOM_CHECK_DB_NAME: () => 'customChecks',
    FRONTMAN_DB_NAME: () => 'frontman',
  },
  methods: {
    chart_formatPercent(value) {
      if (! value.toFixed)
        return `${value}%`;

      return `${value.toFixed(2).replace(/\.00$/, '')}%`;
    },
    chart_formatBytes(value) {
      return filesize(value);
    },
    chart_formatBytesPerSecond(value) {
      return `${filesize(value)}/s`;
    },
    chart_setChartPeriodDefaults(includeQuickCharts = false) {
      if (includeQuickCharts)
        this.chart_quickChartDefaultFrom = this.timestampNowSubtract(6, 'hour');

      this.chart_chartDefaultFrom = this.timestampNowSubtract(1, 'hour');
      this.chart_chartDefaultTo = this.timestampNow();
    },
    chart_formatSeconds(value) {
      return `${value}s`;
    },
    chart_formatValuesByUnit(value, unit) {
      switch (unit) {
        case 'B':
        case 'KB':
        case 'MB':
        case 'GB':
          return this.chart_formatBytes(value);
        case '%':
          return this.chart_formatPercent(value);
        case 'ms':
          return this.chart_formatSeconds(value);
        case 'Bps':
        case 'MBps':
          return this.chart_formatBytesPerSecond(value);
        default:
          return value;
      }
    },
    chart_cpuTooltipPreprocessor(value) {
      let result;
      const m = value.match(/^cpu\sutil\s(.+)\s(\d+)\stotal/i);

      if (Array.isArray(m) && m.length && m.length > 2) {
        result = `${this.$t('phrase.cpu')} ${this.$t('host.chart.util')}`;

        const cpuName = m[1].charAt(0).toUpperCase() + m[1].slice(1);

        result += ` ${cpuName} ${this.$t('host.chart.total')}`;
        result += ` ${this.$tc('host.chart.averageOfLastNMinutes', parseInt(m[2]),
          { count: m[2] })} `;
      } else {
        result = value;
      }

      return result;
    },
    chart_isTextBased(key) {
      return !! key.match(/\..*(text|message|log|error|alert|warning)$/i);
    },
  },
};
