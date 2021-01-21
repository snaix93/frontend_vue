<template>
  <div id="jobs-table">
    <v-data-table
      v-if="totalCount"
      :headers="headers"
      :hide-actions="totalCount < 11"
      :items="jobmonResults"
      :pagination.sync="pagination"
      :rows-per-page-items="rowsPerPage"
      :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
      disable-initial-sort
      item-key="jobId"
    >
      <template #items="{ item: JobmonResult }">
        <tr
          :class="`qa-job-${safeQAClass(JobmonResult.jobId)}`"
          class="pointer"
        >
          <td>
            <div class="font-weight-medium" @click="showJobmonResultDialog(JobmonResult)">
              {{ JobmonResult.jobId }}
            </div>
          </td>
          <td>
            <v-chip
              v-if="JobmonResult.lastJob.status"
              :color="useJobmonResultStatus_statusColor(JobmonResult.lastJob.status)"
              small
              text-color="white"
            >
              {{ $tc(`phrase.${JobmonResult.lastJob.status}`).toUpperCase() }}
            </v-chip>
          </td>
          <td>
            {{ JobmonResult.lastJob.dates.jobStarted.local.formatted }}
          </td>
          <td>
            <v-tooltip
              bottom
            >
              <v-avatar
                v-if="JobmonResult.lastJob.status !== 'succeeded'"
                slot="activator"
                :color="severityColor(JobmonResult.lastJob)"
                class="pointer"
                size="24px"
              >
                <v-icon
                  color="white"
                  small
                >
                  notifications
                </v-icon>
              </v-avatar>
              <span v-if="!JobmonResult.lastJob.severity || JobmonResult.lastJob.severity === 'none'">
                {{ $tc('host.items.alertsOrWarningsSwitchedOff') | capitalize }}
              </span>
              <span v-else>
                {{ $tc(`phrase.${JobmonResult.lastJob.severity}`) | capitalize }}
              </span>
            </v-tooltip>
          </td>
          <td class="pl-2 pr-2 text-no-wrap text-xs-right">
            <v-btn
              class="mx-0"
              icon
              @click.native.stop="showJobmonResultDialog(JobmonResult)"
            >
              <v-icon color="grey">
                remove_red_eye
              </v-icon>
            </v-btn>
            <v-btn
              :disabled="$wait.is(waitDeleteKeys(JobmonResult))"
              class="ml-0 qa-jobmon-delete"
              icon
              @click.native.stop="deleteWithConfirmation(JobmonResult)"
            >
              <v-icon
                v-if="$wait.is(waitDeleteKeys(JobmonResult))"
                color="grey"
              >
                delete_forever
              </v-icon>
              <v-icon v-else color="error">
                delete
              </v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
      <template #no-data>
        <TableNoData :is-loading="$fetchState.pending"/>
      </template>
      <template #page-text="{ pageStart, pageStop, itemsLength }">
        {{ $t('paging.count', { pageStart, pageStop, itemsLength }) }}
      </template>
    </v-data-table>
    <JobmonResultDeleteDialog
      v-if="deleteDialog"
      @on-delete="onDelete"
    />
  </div>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import JobmonResultDeleteDialog from '@/components/Hosts/JobmonResults/JobmonResultDeleteDialog';

  import useJobmonResultStatus from '@/mixins/useJobmonResultStatus';
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import useFilters from '@/mixins/useFilters';

  import JobmonResult from '@/models/JobmonResult';
  import TableNoData from '@/components/App/TableNoData';

  export default {
    components: {
      TableNoData,
      JobmonResultDeleteDialog,
    },
    mixins: [
      useJobmonResultStatus,
      useFilters,
      useFilterablePagination,
    ],
    async fetch() {
      await this.getJobmonResults({
        JobmonResult: this.Host.jobmonResults()
                          .params({ search: this.filters.search })
                          .orderBy(this.filters.sortBy)
                          .page(this.filters.page)
                          .limit(this.filters.limit),
      });
      this.$emit('on-fetch', { summary: this.jobmonResultsSummary(this.jobmonResults) });
    },
    data() {
      return {
        filters: JobmonResult.filters,
        headers: [
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.name', 1)),
            align: 'left',
            value: 'jobId',
            width: '5%',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.state')),
            align: 'left',
            value: 'state',
            width: '1%',
            sortable: false,
          },
          {
            text: this.$options.filters.capitalize(this.$tc('host.jobmonResults.lastRun')),
            align: 'left',
            value: 'lastRun',
            width: '1%',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.severity')),
            align: 'left',
            value: 'severity',
            width: '1%',
            sortable: true,
          },
          {
            text: '',
            align: 'right',
            width: '1%',
            value: null,
            sortable: false,
          },
        ],
      };
    },
    computed: {
      ...mapState('hosts', ['Host']),
      ...mapState('jobmonResults', [
        'jobmonResults', 'totalCount', 'selectedJobmonResult',
        'jobmonResultDialog', 'deleteDialog',
      ]),
    },
    methods: {
      ...mapMutations('jobmonResults', [
        'setSelectedJobmonResult',
        'toggleJobmonResultDialog',
        'toggleDeleteDialog',
      ]),
      ...mapActions('jobmonResults', ['getJobmonResults']),
      async showJobmonResultDialog(JobmonResult) {
        this.setSelectedJobmonResult(JobmonResult);
        this.toggleJobmonResultDialog();
      },
      jobmonResultsSummary(jobmonResults) {
        const jobCount = jobmonResults.length;
        const alertCount = jobmonResults.filter(
          ({ lastJob }) => (lastJob.severity === 'alert' && lastJob.status !== 'succeeded')
        ).length;
        const warningCount = jobmonResults.filter(
          ({ lastJob }) => (lastJob.severity === 'warning' && lastJob.status !== 'succeeded')
        ).length;
        const result = [
          `${jobCount} ${this.$tc('phrase.job', jobCount)}`,
        ];

        if (alertCount > 0)
          result.push(`<span
            class="error--text font-weight-bold">
              ${alertCount} ${this.$tc('host.alert', alertCount)}
          </span>`);

        if (warningCount > 0)
          result.push(`<span
            class="warning--text font-weight-bold">
              ${warningCount} ${this.$tc('phrase.warning', warningCount)}
          </span>`);

        return result.join(', ');
      },
      onFetchError() {
        this.$flash.error(this.$t('message.error.couldNotLoadJobmonData'));
      },
      severityColor({ severity }) {
        if (severity === 'warning') return 'warning';
        if (severity === 'alert') return 'error';

        return 'grey';
      },
      safeQAClass(jobId) {
        return jobId ? jobId.replace('_', ' ') : 'nokey';
      },
      waitDeleteKeys(JobmonResult) {
        return [
          this.$WAIT_FOR.JOBMON_RESULT.DELETE_ID(JobmonResult.jobId),
          this.$WAIT_FOR.JOBMON_RESULT.CONFIRM_DELETE_ID(JobmonResult.jobId),
        ];
      },
      deleteWithConfirmation(JobmonResult) {
        this.setSelectedJobmonResult(JobmonResult);
        this.toggleDeleteDialog();
      },
      onDelete({ JobmonResult, success = true }) {
        this.$emit('on-delete', { JobmonResult, success });
      },
    },
  };
</script>
