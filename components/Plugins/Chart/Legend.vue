<template>
  <div class="chart-legend">
    <v-layout
      row
      wrap
      justify-start
      class="px-3 mt-2 mb-3"
    >
      <v-flex
        v-for="(dataset, i) in chartData.datasets"
        :key="i"
        sm12
        :md4="view === 'list'"
        :md6="view === 'col2'"
        :md12="view === 'col3'"
        :lg6="view === 'col3'"
        :lg4="view !== 'col3'"
        class="chart-legend--item text-truncate px-1 py-0"
      >
        <v-checkbox
          v-model="dataset.hidden"
          :true-value="false"
          :false-value="true"
          class="chart-legend--checkbox ma-0"
          hide-details
          @change="onUpdateDataset"
        >
          <v-tooltip
            slot="label"
            :disabled="!hasTooltipPreprocessor && (dataset.label.length < 30)"
            bottom
          >
            <span
              slot="activator"
              class="chart-legend--label caption"
            >
              <span
                class="chart-legend--label--box mr-2"
                :style="'background-color:' + backgroundColor(i)"
              />
              <span
                v-if="dataset.label"
                class="chart-legend--label--text"
              >{{
                dataset.label
              }}</span>
            </span>
            <span class="chart-legend--tooltip">
              <template v-if="hasTooltipPreprocessor">
                {{ chartOptions.legend.tooltip.preprocessor(dataset.label) }}
              </template>
              <template v-else>
                {{ dataset.label }}1
              </template>
            </span>
          </v-tooltip>
        </v-checkbox>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
  export default {
    props: {
      chart: {
        type: Object,
        required: true,
      },
      chartData: {
        type: Object,
        required: true,
      },
      chartOptions: {
        type: Object,
        required: false,
        default: null,
      },
      view: {
        type: String,
        required: false,
        default: 'grid',
      },
    },
    computed: {
      hasTooltipPreprocessor() {
        return (
          this.chartOptions.legend
          && this.chartOptions.legend.tooltip
          && this.chartOptions.legend.tooltip.preprocessor
        );
      },
    },
    methods: {
      backgroundColor(i) {
        let backgroundColor = 'rgba(255,255,255)';

        try {
          backgroundColor = this.getDatasetMeta(i).dataset?._model?.borderColor;
        } catch (error) {
          console.log(error);
        }

        return backgroundColor;
      },
      getDatasetMeta(i) {
        return this.chart.controller.getDatasetMeta(i);
      },
      onUpdateDataset() {
        this.chart.controller.update();
      },
    },
  };
</script>
<style lang="stylus" scoped>
  .chart-legend
    .chart-legend--item
      .chart-legend--label
        display: flex
        align-items: center

        .chart-legend--label--box
          display: block
          height: 15px
          width: 24px
          min-width: 24px
          vertical-align: middle
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2)
          transition: background-color 0.4s ease-in

        .chart-legend--label
          display: block
</style>

<style lang="stylus">
  .chart-legend
    width: 100%

    .chart-legend--item
      .chart-legend--checkbox
        padding-top: 0
        overflow: hidden

        .v-input__control,
        .v-label,
        .v-tooltip
          overflow: hidden

        .v-input--selection-controls__input
          margin-right: 0
          transform: scale(0.75)
          transform-origin: left

        .chart-legend--label--text
          display: block;
          max-height: 20px
          overflow: hidden
          white-space: nowrap
          text-overflow: ellipsis
</style>
