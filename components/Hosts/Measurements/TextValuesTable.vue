<template>
  <v-card
    color="transparent"
    flat
  >
    <v-card-text
      v-if="requestCanceled"
      @click="reattemptToFetchData"
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
    </v-card-text>
    <v-card-text
      v-else-if="$wait.is(waitKey) || $fetchState.pending"
    >
      <v-layout
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
    </v-card-text>
    <v-card-text
      v-else-if="loadingError"
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
    </v-card-text>
    <template v-else>
      <v-card-text class="pt-0">
        <v-layout
          align-middle
          justify-end
          pb-2
          row
          wrap
        >
          <v-flex
            :class="{
              'pr-4' : !!$vuetify.breakpoint.mdAndUp
            }"
            shrink
          >
            <v-switch
              v-model="doNotTruncateValues"
              :label="$t('host.showFullContent') | capitalize"
              hide-details
            />
          </v-flex>
          <v-flex
            md5
            xs12
          >
            <v-text-field
              v-model="search"
              :label="$t('form.field.search') | capitalize"
              append-icon="search"
              clearable
              hide-details
              single-line
            />
          </v-flex>
        </v-layout>
      </v-card-text>
      <v-divider/>
      <v-data-table
        :custom-filter="useFrontendFilter_expressionSearch"
        :headers="headers"
        :items="items"
        :pagination.sync="pagination"
        :rows-per-page-items="rowsPerPage"
        :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
        :search="search"
        class="qa-text-values-tbl text-values-table"
        item-key="value"
      >
        <template #header-cell="props">
          {{ props.header.text | capitalize }}
        </template>
        <template #items="props">
          <v-hover>
            <template #default>
              <tr>
                <td
                  :class="{
                    'cell--truncate' : !doNotTruncateValues
                  }"
                  class="font-weight-medium pl-3 pr-2"
                >
                  <v-tooltip bottom>
                    <span
                      slot="activator"
                      class="pointer"
                      v-html="useFrontendFilter_highlightSearchResults(
                        props.item.value,
                        search
                      )"
                    />
                    <span>
                      {{ props.item.value }}
                    </span>
                  </v-tooltip>
                </td>
                <td class="pl-0 pr-2">
                  {{ formattedDateTime(props.item.date) }}
                </td>
              </tr>
            </template>
          </v-hover>
        </template>
        <template #no-results>
          <div class="text-xs-center">
            {{ $t('message.error.noSearchResults', { term: search }) }}
          </div>
        </template>
      </v-data-table>
    </template>
  </v-card>
</template>

<script>
  import { mapActions } from 'vuex';
  import chartMixins from '@/mixins/chart';
  import useDateTime from '@/mixins/useDateTime';
  import useFrontendFilter from '@/mixins/useFrontendFilter';
  import ChartWorker from '@/workers/chart.worker.js';

  export default {
    mixins: [
      chartMixins,
      useDateTime,
      useFrontendFilter,
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
    },
    data() {
      return {
        rowsPerPage: [10, 25, 50, { text: this.$t('phrase.all'), value: -1 }],
        pagination: {
          sortBy: 'date',
          descending: true,
        },
        search: '',
        doNotTruncateValues: false,
        headers: [
          {
            text: this.$options.filters.capitalize(
              this.$t('phrase.value')
            ),
            align: 'left',
            value: 'value',
            class: 'pl-3 pr-2',
          },
          {
            text: this.$options.filters.capitalize(
              this.$t('phrase.date')
            ),
            value: 'date',
            class: 'pl-0 pr-2',
            width: '15%',
          },
        ],
        items: [],
        requestCanceled: false,
        loadingError: false,
        errorMessage: this.$t('message.error.dataLoad'),
      };
    },
    fetch() {
      this.worker = new ChartWorker();
      // This needs to be left to this 10ms delay to ensure the batch
      // method runs first, if applicable.
      setTimeout(() => {
        this.get(this.chart_processedParams);
      }, 10);
    },
    computed: {
      waitKey() {
        return `host.historical-data.${this.singleKey
                                       ? `single.${this.hostId}.${this.endpoint}`
                                       : this.endpoint}`;
      },
    },
    watch: {
      endpoint() {
        this.get(this.chart_processedParams);
      },
      periodStart() {
        this.get(this.chart_processedParams);
      },
      periodEnd() {
        this.get(this.chart_processedParams);
      },
      limit() {
        this.get(this.chart_processedParams);
      },
    },
    methods: {
      ...mapActions('hostCharts', {
        getHostCharts: 'get'
      }),
      reset() {
        this.loadingError = false;
        this.$wait.end(this.waitKey);
      },
      error() {
        this.loadingError = true;
        this.$wait.end(this.waitKey);
      },
      async get(params) {
        this.reset();
        this.requestCanceled = false;

        this.$wait.start(this.waitKey);

        try {
          const response = await this.getHostCharts({
            singleKey: this.singleKey,
            endpoint: this.endpoint,
            hostId: this.hostId,
            db: this.db,
            params,
          });

          this.worker.onmessage = ({ data: result }) => {
            this.items = result.chartData.datasets
                               .map(({ data }) => {
                                 return data.map(({ x: date, y: value }) => ({ date, value }));
                               })
                               .flat();

            this.reset();
          };

          this.worker.postMessage({
            response,
            teamTimezone: this.$auth.team.timezone,
          });
        } catch (e) {
          if (e.message.timedOut || e.timedOut) {
            // This block will trigger if one of the graph requests times out.
            // This is registered in the axios plugin.
            this.requestCanceled = true;
          }

          this.error();
        }
      },
      async reattemptToFetchData(event) {
        if (this.requestCanceled) {
          event.preventDefault();
          event.stopPropagation();
          // timed-out graph has been clicked so lets try it again
          await this.get(this.chart_processedParams);
        }
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .highlighted-search-result
    display: inline-block
    white-space: pre
</style>
