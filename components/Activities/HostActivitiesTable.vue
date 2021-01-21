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
            <MonthDatePicker
              v-model="filters.month"
              :allowed-dates="allowedDates"
            />
          </v-flex>
        </v-layout>
      </v-card-text>

      <v-alert
        v-for="(value, key, index) in content"
        :key="index"
        :type="key"
        :value="true"
        class="my-0"
      >
        {{ value }}
      </v-alert>

      <v-divider/>

      <v-data-table
        v-if="hostActivities"
        :headers="headers"
        :hide-actions="totalCount <= rowsPerPage[0]"
        :items="hostActivities"
        :pagination.sync="pagination"
        :rows-per-page-items="rowsPerPage"
        :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
        :total-items="totalCount"
        data-cy="hostActivitiesList"
        disable-initial-sort
      >
        <template #items="{ item: HostActivity }">
          <tr>
            <td>
              <nuxt-link
                v-if="!HostActivity.dates.deletedAt && $auth.user.isNotReadOnly()"
                :to="'/hosts/' + HostActivity.hostId"
                class="text--primary no-text-decoration"
              >
                {{ HostActivity.name }}
              </nuxt-link>
              <span v-else>
                {{ HostActivity.name }}
              </span>
            </td>
            <td>
              {{ HostActivity.dates.durationStartAt.formatted }} &rarr;
              {{ HostActivity.dates.durationEndAt.formatted }}
            </td>
            <td class="text-xs-center">
              <span v-if="HostActivity.dates.deletedAt">
                <v-chip
                  color="error"
                  outline
                  small
                >
                  {{ $t('activity.hostState.deleted') }}
                </v-chip>
              </span>
              <span v-else>
                <v-chip
                  color="success"
                  outline
                  small
                >
                  {{ $t('activity.hostState.active') }}
                </v-chip>
              </span>
            </td>
            <td class="text-xs-center">
              {{ HostActivity.duration }}
              {{ $tc('phrase.day', HostActivity.duration) }}
            </td>
            <td class="text-xs-center">
              {{ HostActivity.totalPaid }} {{ currencySymbol }}
            </td>
          </tr>
        </template>

        <!-- Hide total monthly cost for now, due to paginated content returned from backend it might happen
         that only parts of the entries is returned and therefore the sum of their totals might not be correct
         We either need the backend to include total monthly cost in the response to just display in the frontend
         or the number of all activities to do correct calculation of monthly total costs in the frontend. -->
        <!--template #footer>
          <td
            :colspan="headers.length - 2"
            class="border-top-2"
          />
          <td class="font-weight-bold border-top-2 text-xs-center">
            Total (all):
          </td>
          <td class="border-top-2 text-xs-center">
            {{ totalCost() }} {{ currencySymbol }}
          </td>
        </template-->

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
  import moment from 'moment';
  import { mapActions, mapState } from 'vuex';
  import AppWait from '@/components/App/AppWait';
  import MonthDatePicker from '@/components/App/DatePicker/MonthDatePicker';
  import useFilters from '@/mixins/useFilters';
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import HostActivity from '@/models/HostActivity';
  import user from '@/mixins/user';
  import TableNoData from '@/components/App/TableNoData';

  export default {
    components: {
      TableNoData,
      AppWait,
      MonthDatePicker
    },
    mixins: [
      useFilters,
      useFilterablePagination,
      user
    ],
    async fetch() {
      await this.filter();
    },
    data() {
      return {
        filters: HostActivity.filters,
      };
    },
    computed: {
      ...mapState('hostActivities', ['hostActivities', 'totalCount', 'hostActivityEpoch', 'content']),
      ...mapState('app', ['pricing']),
      currencySymbol() {
        return this.user_currency.symbol;
      },
      teamCreatedDate() {
        return moment.unix(this.$auth.team.dates.createdAt.timestamp).startOf('month');
      },
      headers() {
        return [
          {
            text: this.$options.filters.capitalize(
              this.$tc('activity.table.host'),
            ),
            sortable: false,
          },
          {
            text: this.$options.filters.capitalize(
              this.$tc('activity.table.period'),
            ),
            sortable: false,
          },
          {
            text: this.$options.filters.capitalize(
              this.$tc('activity.table.state'),
            ),
            sortable: false,
            align: 'center',
          },
          {
            text: this.$options.filters.capitalize(
              this.$tc('activity.table.timeUnderMonitoring'),
            ),
            sortable: false,
            align: 'center',
          },
          {
            text: this.$options.filters.capitalize(
              `${this.$tc('activity.table.price')} ${this.currencySymbol}`,
            ),
            sortable: false,
            align: 'center',
          }
        ];
      },
    },
    created() {
      this.filters.month = moment().format('Y-MM');
    },
    methods: {
      ...mapActions('hostActivities', ['getHostActivities']),
      async filter() {
        await this.getHostActivities({
          HostActivity: HostActivity.filter(this.filters)
        });
        this.useFilters_initialLoadCompleted();
      },
      allowedDates(date) {
        date = moment(date);
        return (
          this.isPast(date)
          && this.isPostEpoch(date)
          && this.isPostUserSignUp(date)
        );
      },
      isPast(date) {
        return moment().diff(date) > 0;
      },
      isPostEpoch(date) {
        return this.hostActivityEpoch.diff(date) <= 0;
      },
      isPostUserSignUp(date) {
        return this.teamCreatedDate.diff(date) <= 0;
      },
      totalCost() {
        let initialValue = 0;
        let sum = this.hostActivities.reduce(
          (accumulator, currentValue) => accumulator + currentValue.totalPaid
          , initialValue
        );
        return sum.toFixed(2);
      },
    },
  };
</script>

<style lang="stylus" scoped>
  td.border-top-2
    border-top 3px double black
</style>
