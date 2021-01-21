<template>
  <div>
    <v-card-text>
      <v-layout wrap>
        <v-flex xs12>
          <v-alert
            :value="disableReportForm()"
            outline
            type="error"
          >
            {{ $t('report.datesBackwardsWarning') }}
          </v-alert>
        </v-flex>
        <v-flex md2 sm3 xs12>
          <v-menu
            ref="menu1"
            v-model="fromDateMenu"
            :close-on-content-click="false"
            class="datetimepickers"
            full-width
            lazy
            max-width="300px"
            min-width="300px"
            offset-y
            transition="scale-transition"
          >
            <v-text-field
              slot="activator"
              v-model="dates.from"
              :label="$t('report.from') | capitalize"
              hide-details
              persistent-hint
              readonly
            />
            <date-pick
              v-model="dates.from"
              :format="'YYYY-MM-DD HH:mm'"
              :has-input-element="false"
              :is-date-disabled="disableFromDates"
              :pick-time="true"
            />
          </v-menu>
        </v-flex>
        <v-flex md2 sm3 xs12>
          <v-menu
            ref="menu2"
            v-model="toDateMenu"
            :close-on-content-click="false"
            class="datetimepickers"
            full-width
            lazy
            max-width="300px"
            min-width="300px"
            offset-y
            transition="scale-transition"
          >
            <v-text-field
              slot="activator"
              v-model="dates.to"
              :disabled="$fetchState.pending"
              :label="$t('report.to') | capitalize"
              hide-details
              persistent-hint
              readonly
            />
            <date-pick
              v-model="dates.to"
              :format="'YYYY-MM-DD HH:mm'"
              :has-input-element="false"
              :is-date-disabled="disableToDates"
              :pick-time="true"
            />
          </v-menu>
        </v-flex>
        <v-flex md3 sm6 xs12>
          <v-select
            v-model="reportOnHost"
            :disabled="$fetchState.pending"
            :items="hostsAndFrontmen"
            :label="$t('report.filterByHost')"
            clearable
            item-value="id"
            menu-props="offset-y"
          >
            <template #selection="data">
              {{ data.item.name }}
            </template>

            <template #item="data">
              {{ data.item.name }}
              <span class="caption grey--text text--darken-1 ml-1">{{
                  data.item.connect
                }}</span>
            </template>
          </v-select>
        </v-flex>
        <v-flex
          class="mt-1 text-xs-right"
          md5
          sm12
          xs12
        >
          <v-btn
            :disabled="!totalCount|| $wait.is($WAIT_FOR.REPORT.ALL)"
            color="primary"
            outline
            type="submit"
          >
            <v-progress-circular
              v-if="$wait.is($WAIT_FOR.REPORT.DOWNLOAD)"
              :size="20"
              :width="2"
              color="secondary"
              indeterminate
            />
            <download-csv
              :export-fields="exportFields"
              :fetch="fetchReportsForDownload"
              :name="exportFileName"
              type="csv"
            >
              {{ $t('button.downloadCsv') }}
            </download-csv>
          </v-btn>

          <v-btn
            :disabled="disableReportForm() || $wait.is($WAIT_FOR.REPORT.ALL)"
            color="primary"
            @click="runReport"
          >
            <v-progress-circular
              v-if="$wait.is(['report.run'])"
              :size="20"
              :width="2"
              color="secondary"
              indeterminate
            />
            <template v-else>
              {{ $t('button.runReport') }}
            </template>
          </v-btn>

          <div class="caption grey--text text--darken-1">
            {{ $t('report.dataRetentionMessage', { num: $auth.team.dataRetention }) }}
          </div>
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-divider/>
    <v-card-text class="pt-1">
      <v-layout
        align-end justify-end pb-3
        wrap
      >
        <SearchBox
          v-model="filters.search"
          :search-by="['event meta', 'host name']"
        />
      </v-layout>
    </v-card-text>
    <v-divider/>
    <div class="position-relative">
      <v-data-table
        :headers="headers"
        :items="reports"
        :pagination.sync="pagination"
        :rows-per-page-items="rowsPerPage"
        :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
        :total-items="totalCount"
        data-cy="reportsList"
        item-key="id"
      >
        <template #items="{ item: Report }">
          <tr :class="reportTableRowClass(Report)">
            <td>
              <v-tooltip
                v-if="hostUuids.indexOf(Report.hostId) === -1"
                bottom
              >
                <span
                  slot="activator"
                  class="dashed-underline"
                >
                  {{ Report.hostName }}
                </span>
                {{ $t('report.hostDeleted') | capitalize }}
              </v-tooltip>
              <nuxt-link
                v-else-if="$auth.user.isNotReadOnly()"
                :to="'/hosts/' + Report.hostId"
                class="text--primary no-text-decoration"
              >
                {{ Report.hostName }}
              </nuxt-link>
              <span v-else>
                {{ Report.hostName }}
              </span>
            </td>
            <td>
              <template v-if="Report.issue">
                {{ Report.issue }}
              </template>
              <template v-else>
                <strong>{{ $t('report.noIssues') | capitalize }}</strong>
              </template>
            </td>
            <td>
              {{
                (Report.severity ? $t('phrase.' + Report.severity) : '')
                  | capitalize
              }}
            </td>
            <td>
              {{ Report.time ? secondsToTime(Report.time) : '' }}
            </td>
            <td>
              {{
                Report.percent !== undefined
                ? Report.percent.toFixed(2)
                : ''
              }}
              <v-progress-linear
                v-if="Report.percent !== undefined"
                :value="Report.percent"
                background-color="green lighten-2"
                class="check-value-graph ma-0"
                color="red lighten-1"
              />
            </td>
          </tr>
        </template>
        <template #no-results>
          <div class="text-xs-center">
            {{ $t('message.error.noSearchResults', { term: filters.search }) }}
          </div>
        </template>
        <template #no-data>
          <TableNoData :is-loading="$fetchState.pending"/>
        </template>
        <template #page-text="{ pageStart, pageStop, itemsLength }">
          {{ $t('paging.count', { pageStart, pageStop, itemsLength }) }}
        </template>
      </v-data-table>
      <AppWait
        :hide-message="true"
        :wait="useFilters_initialLoadComplete && $fetchState.pending"
        height="100%"
      />
    </div>
  </div>
</template>

<script>
  import moment from 'moment';
  import Report from '@/models/Report';
  import Host from '@/models/Host';
  import DatePick from 'vue-date-pick';
  import JsonExcel from 'vue-json-excel';
  import userMixins from '@/mixins/user';
  import { mapActions, mapState } from 'vuex';
  import useFilters from '@/mixins/useFilters';
  import useDateTime from '@/mixins/useDateTime';
  import AppWait from '@/components/App/AppWait';
  import SearchBox from '@/components/Form/SearchBox';
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import TableNoData from '@/components/App/TableNoData';
  import usePersistableFilters from '@/mixins/usePersistableFilters';

  // TODO: uncomment load frontmen commented out code in case we will make sort by frontmen

  export default {
    components: {
      TableNoData,
      AppWait,
      DatePick,
      SearchBox,
      downloadCsv: JsonExcel,
    },
    mixins: [
      useFilterablePagination,
      usePersistableFilters,
      useDateTime,
      userMixins,
      useFilters,
    ],
    data() {
      return {
        filters: Report.filters,
        persistableFilterKey: Report.persistableFilterKey,
        hosts: [],
        dates: {},
        toDateMenu: false,
        reportOnHost: false,
        fromDateMenu: false,
        reportsToDownload: [],
        headers: [
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.host', 1)),
            value: 'host-name',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.issue', 1)),
            value: 'issue',
            align: 'left',
            sortable: false,
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.severity')),
            value: 'severity',
            align: 'left',
            sortable: false,
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.duration')),
            value: 'time',
            align: 'left',
            sortable: false,
          },
          {
            text: '%',
            value: 'percent',
            align: 'left',
            width: '90px',
            sortable: false,
          },
        ],
      };
    },
    computed: {
      ...mapState('reports', [
        'reports', 'Report', 'totalCount'
      ]),
      exportFileName() {
        return `Issue Report: ${this.dates.from} - ${this.dates.to}.csv`;
      },
      exportFields() {
        return {
          'Host Name': 'hostName',
          Issue: {
            callback: ({ issue }) => {
              if (issue !== null && typeof issue === 'string') {
                // strip line breaks
                issue = issue.replace(/(\r\n|\n|\r)/gm, ' ');
                // remove double spaces
                issue = issue.replace(/\s+/g, ' ');
              }
              return issue;
            },
          },
          Severity: 'severity',
          Percent: 'percent',
          'Time Ago': {
            field: 'time',
            callback: value => this.secondsToTime(value),
          },
          'Time Ago In Seconds': 'time',
        };
      },
      hostsAndFrontmen() {
        return [
          {
            name: this.$options.filters.capitalize(
              `${this.$tc('phrase.host', 2)}:`,
            ),
            disabled: true,
          },
          ...this.hosts,
          // TODO: enable if sorting by frontmen will be added
          // {
          //   name: this.$options.filters.capitalize(
          //     `${this.$tc('phrase.frontman', 2)}:`,
          //   ),
          //   disabled: true,
          // },
          //
          // ...this.frontmen.map((f) => {
          //   f.name = f.location;
          //   return f;
          // }),
        ];
      },
      hostUuids() {
        return this.hosts.map(({ id }) => id);
      },
    },
    async fetch() {
      await this.filter();
    },
    async created() {
      this.setFilters({
        from: moment()
          .seconds(0)
          .add(1, 'minute')
          .subtract(1, 'day')
          .utc()
          .unix(),
        to: moment()
          .seconds(0)
          .add(1, 'minute')
          .utc()
          .unix(),
      }, false);

      this.dates = {
        from: moment
          .unix(this.filters.from)
          .tz(this.$auth.team.timezone)
          .format('YYYY-MM-DD HH:mm'),
        to: moment
          .unix(this.filters.to)
          .tz(this.$auth.team.timezone)
          .format('YYYY-MM-DD HH:mm'),
      };
      this.hosts = await Host.fetchHostSummaryList();
    },
    methods: {
      ...mapActions('reports', ['getReports']),
      // ...mapActions('frontmen', ['getFrontmen']),
      // ...mapActions('refData', ['getPublicFrontmen']),
      async filter() {
        await this.getReports({
          Report: Report.filter({ ...this.filters })
        });
        this.useFilters_initialLoadCompleted();
      },
      async fetchReportsForDownload() {
        this.$wait.start(this.$WAIT_FOR.REPORT.DOWNLOAD);
        try {
          return Report.downloadReports(
            moment.tz(this.dates.from, this.$auth.team.timezone).utc().unix(),
            moment.tz(this.dates.to, this.$auth.team.timezone).utc().unix()
          );
        } finally {
          this.$wait.end(this.$WAIT_FOR.REPORT.DOWNLOAD);
        }
      },
      reportTableRowClass(Report) {
        if (! Report.host) return false;
        return [{ 'report-row-host-deleted': this.hostUuids.includes(Report.hostId) }];
      },
      async runReport() {
        this.setFilters({
          ...this.filters,
          host: !! this.reportOnHost ? this.reportOnHost : undefined,
          from: moment.tz(this.dates.from, this.$auth.team.timezone).utc().unix(),
          to: moment.tz(this.dates.to, this.$auth.team.timezone).utc().unix()
        });
      },
      isFutureDate(date) {
        const currentDate = new Date();
        return date > currentDate;
      },
      isPriorToAllowableDate(date) {
        // disable all dates prior to dataRetention setting
        const earliestAllowedDate = moment()
          .subtract(this.$auth.team.dataRetention, 'days')
          .startOf('day');
        const dateFromPicker = moment(date);

        return dateFromPicker.diff(earliestAllowedDate) < 0;
      },
      disableFromDates(date) {
        if (this.isFutureDate(date) || this.isPriorToAllowableDate(date)) {
          return true;
        }

        // must be before the TO date
        const from = moment(date);
        const to = moment(this.dates.to).startOf('day');

        return from.diff(to) > 0;
      },
      disableToDates(date) {
        if (this.isFutureDate(date) || this.isPriorToAllowableDate(date)) {
          return true;
        }

        // must be later than the FROM date
        const from = moment(this.dates.from).startOf('day');
        const to = moment(date);

        return to.diff(from) < 0;
      },
      disableReportForm() {
        // if FROM date is before TO date then disable and show alert
        const from = moment(this.dates.from);
        const to = moment(this.dates.to);

        return to.diff(from) < 0;
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .report-row-host-deleted
    box-shadow: inset 6px 0 0 0 var(--v-primary-base);
</style>
