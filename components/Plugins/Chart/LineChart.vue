<script>
  import { merge } from 'lodash-es';

  import { Line } from 'vue-chartjs';
  import 'chartjs-plugin-colorschemes';
  import 'chartjs-plugin-crosshair';

  export default {
    extends: Line,
    props: {
      chartData: {
        type: Object,
        default: null,
      },
      chartOptions: {
        type: Object,
        required: false,
        default: null,
      },
      printChart: {
        type: Boolean,
        required: false,
        default: false,
      },
      timeBased: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    data() {
      return {
        printImg: null,
      };
    },
    computed: {
      options() {
        const defaults = {
          animation: {
            duration: 300,
          },
          maintainAspectRatio: false,
          responsive: true,
          scales: {
            xAxes: [
              {
                ticks: {
                  fontSize: 11,
                  padding: 5,
                  maxRotation: 0,
                  autoSkipPadding: 50,
                },
                gridLines: {
                  tickMarkLength: 5,
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  fontSize: 11,
                  padding: 5,
                  maxTicksLimit: 3,
                },
                gridLines: {
                  tickMarkLength: 5,
                },
              },
            ],
          },
          tooltips: {
            mode: 'index',
            intersect: false,
            cornerRadius: 3,
          },
          legend: {
            display: false,
          },
          plugins: {
            colorschemes: {
              scheme: 'tableau.Classic10',
              fillAlpha: 0.2,
            },
            crosshair: {
              sync: {
                enabled: false,
              },
              line: {
                color: '#999',
              },
              zoom: {
                enabled: false,
                // zoomButtonClass:
                //   'v-btn v-btn--small v-btn--absolute v-btn--top v-btn--right theme--light',
              },
            },
          },
        };

        if (this.timeBased) {
          defaults.scales.xAxes[0].type = 'time';
          defaults.scales.xAxes[0].time = {
            tooltipFormat: 'MMM DD HH:mm',
            displayFormats: {
              minute: 'MMM DD HH:mm',
              hour: 'MMM DD HH:mm',
            },
          };
        }

        return this.chartOptions ? merge(defaults, this.chartOptions) : defaults;
      },
    },
    watch: {
      chartData() {
        this.render();
        if (this.printChart) {
          this.print();
        }
      },
      printChart(newValue) {
        if (newValue) {
          this.print();
        }
      },
    },
    mounted() {
      this.render();
    },
    methods: {
      // render chart and emit data of rendered chart
      render() {
        this.renderChart(this.chartData, this.options);

        setTimeout(() => {
          this.$emit('render', this.$data._chart);
        }, 300);
      },
      print() {
        // disable animation and show legend
        // this is to prevent capturing the chart while it
        // is in animation
        this.options.legend.display = true;
        this.options.animation.duration = 0;
        this.render();

        // generate image of chart
        this.printImg = this.$refs.canvas.toDataURL('image/png');
        this.$emit('chart:print', this.printImg);

        // bring back default options of the chart
        this.options.legend.display = false;
        this.render();
        this.options.animation.duration = 300;
      },
    },
  };
</script>
