<script>
  import { merge } from 'lodash-es';

  import { Bar } from 'vue-chartjs';

  export default {
    extends: Bar,
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
    },
    computed: {
      options() {
        const defaults = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            crosshair: false,
          },
        };

        return this.chartOptions ? merge(defaults, this.chartOptions) : defaults;
      },
    },
    mounted() {
      this.render();
    },
    methods: {
      render() {
        this.renderChart(this.chartData, this.options);

        setTimeout(() => {
          this.$emit('render', this.$data._chart);
        }, 300);
      },
    },
  };
</script>
