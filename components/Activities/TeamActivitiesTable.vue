<template>
  <v-flex>
    <v-card>
      <v-card-text>
        <v-layout
          align-middle justify-space-between wrap
        >
          <v-flex
            md3 xs6
          >
            <RangeDatePicker
              @on-input="onDatePickerInput"
            />
          </v-flex>
        </v-layout>
      </v-card-text>

      <v-divider/>

      <v-data-table
        v-if="teamActivities"
        :headers="headers"
        :hide-actions="totalCount <= rowsPerPage[0]"
        :items="teamActivities"
        :pagination.sync="pagination"
        :rows-per-page-items="rowsPerPage"
        :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
        :total-items="totalCount"
        data-cy="teamActivitiesList"
        disable-initial-sort
      >
        <template #items="{ item: TeamActivity }">
          <tr>
            <td class="text-no-wrap">
              {{ TeamActivity.dates.createdAt.formatted }}
            </td>
            <td>
              <template v-if="TeamActivity.email">
                <AppChip
                  slot="activator"
                  class="lighten-2"
                  color="grey"
                  small
                  text-color="grey darken-3"
                >
                  {{ TeamActivity.email }}
                </AppChip>
              </template>
              <template v-else-if="TeamActivity.causedId === null">
                <AppChip
                  slot="activator"
                  class="lighten-2"
                  color="grey"
                  small
                  text-color="grey darken-3"
                >
                  {{ $t('activity.backgroundOrAnonymous') | capitalize }}
                </AppChip>
              </template>
              <template v-else>
                <AppChip
                  color="error"
                  icon="error_outline"
                  small
                >
                  {{ $t('activity.userDeleted') | capitalize }}
                </AppChip>
              </template>
            </td>
            <td>
              {{ TeamActivity.action }}
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
      <AppWait
        :hide-message="true"
        :wait="useFilters_initialLoadComplete && $fetchState.pending"
        height="100%"
      />
    </v-card>
  </v-flex>
</template>

<script>
  import { mapActions, mapState } from 'vuex';
  import AppWait from '@/components/App/AppWait';
  import AppChip from '@/components/App/AppChip';
  import RangeDatePicker from '@/components/App/DatePicker/RangeDatePicker';
  import useFilters from '@/mixins/useFilters';
  import useDateTime from '@/mixins/useDateTime';
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import TeamActivity from '@/models/TeamActivity';
  import TableNoData from '@/components/App/TableNoData';

  export default {
    components: {
      TableNoData,
      AppWait,
      AppChip,
      RangeDatePicker
    },
    mixins: [
      useFilters,
      useFilterablePagination,
      useDateTime,
    ],
    async fetch() {
      await this.filter();
    },
    data() {
      return {
        filters: TeamActivity.filters,
        //rowsPerPage: [50, 75, 100],
      };
    },
    computed: {
      ...mapState('teamActivities', ['teamActivities', 'totalCount']),
      headers() {
        return [
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.date')),
            sortable: false,
            width: '15%',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.user')),
            sortable: false,
            width: '15%',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.action')),
            sortable: false,
            align: 'left',
          },
        ];
      },
    },
    created() {
      this.setDefaultTimestamps();
    },
    methods: {
      ...mapActions('teamActivities', ['getTeamActivities']),
      async filter() {
        await this.getTeamActivities({
          TeamActivity: TeamActivity.filter(this.filters)
        });
        this.useFilters_initialLoadCompleted();
      },
      onDatePickerInput(from, to) {
        this.setFilters({ from, to });
        this.$fetch();
      },
      setDefaultTimestamps() {
        const from = this.timestampNowSubtract(1, 'hour');
        const to = this.timestampNow();

        this.setFilters({ from, to });
      },
    },
  };
</script>
