<!--suppress RedundantIfStatementJS -->
<template>
  <div>
    <DashboardInnerToolBar>
      <template v-if="showGroupingMenu">
        <v-flex shrink>
          <div class="text-uppercase caption">
            <v-icon
              class="mr-2"
              small
            >
              fas fa-layer-group
            </v-icon>
            <span v-if="$vuetify.breakpoint.mdAndUp">
              {{ $tc('phrase.group', $teamSettings.get('subUnitManagementEnabled') + 1) }}
            </span>
          </div>
        </v-flex>
        <v-flex shrink>
          <v-chip
            v-if="hasGroupHostTags"
            :close="isAggregatedByGroup"
            :outline="!isAggregatedByGroup"
            :text-color="!isAggregatedByGroup ? 'grey darken-1': 'white'"
            color="grey darken-1"
            data-qa="aggregate:group"
            disabled
            small
            @click="aggregateByGroup"
          >
            Group Tags
          </v-chip>
          <v-chip
            v-if="$teamSettings.get('subUnitManagementEnabled')"
            :close="isAggregatedBySubUnit"
            :outline="!isAggregatedBySubUnit"
            :text-color="!isAggregatedBySubUnit ? 'grey darken-1': 'white'"
            color="grey darken-1"
            data-qa="aggregate:sub-unit"
            disabled
            small
            @click="groupBySubUnit"
          >
            Sub Units
          </v-chip>
        </v-flex>
        <v-divider
          class="mx-3"
          style="margin-top: -4px;"
          vertical
        />
      </template>
      <v-flex shrink>
        <div class="text-uppercase caption">
          <v-icon
            class="mr-2"
            small
          >
            fas fa-layer-group
          </v-icon>
          <span v-if="$vuetify.breakpoint.mdAndUp">
            {{ $t('phrase.filters') }}
          </span>
        </div>
      </v-flex>
      <v-flex md3>
        <v-select
          v-model="appliedFilters"
          :height="25"
          :items="dashboardFilters"
          :menu-props="{
            bottom: true,
            nudgeBottom: 45,
            maxHeight: $vuetify.breakpoint.smAndUp ? 475 : 'auto'
          }"
          background-color="transparent"
          class="qa-dash-filters"
          clearable
          flat
          hide-details
          label="Select filters"
          multiple
          return-object
          single-line
          solo
        >
          <template #selection="{ item, index }">
            <span v-if="index === 0">
              {{ $tc('dashboard.filters.applied', appliedFilters.length) }}
            </span>
          </template>
        </v-select>
      </v-flex>
      <v-divider
        v-if="$vuetify.breakpoint.smAndUp"
        class="mx-3"
        style="margin-top: -4px;"
        vertical
      />
      <v-spacer v-if="$vuetify.breakpoint.smAndUp"/>
      <v-divider
        class="mx-3"
        style="margin-top: -4px;"
        vertical
      />
      <DashboardSettingsFlyOut/>
    </DashboardInnerToolBar>
    <v-flex>
      <SkeletonLoader
        v-if="showSkeletonLoader"
        :display="dashboardView"
      />
      <AppWait
        v-else-if="$fetchState.pending"
        :wait="true"
        hide-message
        opacity="0"
      />
      <template v-if="!$fetchState.pending">
        <AddFirstHostView v-if="showAddFirstHostView"/>
        <AllHiddenView
          v-else-if="showAllHostsHiddenView"
          :show-filtered-message="showFilteredMessage"
        >
          <template #message>
            <p class="mb-1">
              {{ $t('dashboard.allHiddenView.groupFilterText') }}
            </p>
            <v-btn
              class="mx-auto"
              color="primary"
              small
              @click="clearGroupsAndFilters"
            >
              {{ $t('dashboard.allHiddenView.clearGroupsAndFiltersBtn') }}
            </v-btn>
          </template>
        </AllHiddenView>
        <div v-else :class="hostViewTabClass">
          <keep-alive>
            <component
              :is="hostViewComponent"
              data-qa="dashboard:hosts"
            />
          </keep-alive>
        </div>
      </template>

      <DashboardPagination
        v-if="showPagination"
        v-model="filters.page"
        :total-pages="dashboardCounts.pages"
      />

      <HostDashboardFooter/>
      <CheckSuccessDialog v-if="checkSuccessDialog"/>
      <HideHostDialog @on-update="onHideHostFromDashboard"/>

      <HostEventsDialog v-if="eventsDialog && !isAggregatingData"/>
      <AggregatedEventsDialog v-if="eventsDialog && isAggregatingData"/>

      <HostInventoryDialog v-if="inventoryDialog"/>
      <CreateWebCheckWizardDialog
        v-if="webCheckWizardDialog"
        @on-create="onCreateWebCheck"
      />
    </v-flex>
  </div>
</template>

<script>
  import collect from 'collect.js';
  import { mapActions, mapMutations, mapState } from 'vuex';
  import AggregatedMediumCardView from '@/components/Dashboard/Aggregated/AggregatedMediumCardView';
  import CreateWebCheckWizardDialog from '@/components/Dashboard/Hosts/CreateWebCheckWizardDialog';
  import AggregatedEventsDialog from '@/components/Dashboard/Aggregated/AggregatedEventsDialog';
  import AggregatedMiniCardView from '@/components/Dashboard/Aggregated/AggregatedMiniCardView';
  import AggregatedListView from '@/components/Dashboard/Aggregated/AggregatedListView';
  import DashboardSettingsFlyOut from '@/components/Dashboard/DashboardSettingsFlyOut';
  import HostDashboardFooter from '@/components/Dashboard/Hosts/HostDashboardFooter';
  import DashboardInnerToolBar from '@/components/Dashboard/DashboardInnerToolBar';
  import HostMediumCardView from '@/components/Dashboard/Hosts/HostMediumCardView';
  import { DASHBOARD_AGGREGATE_BY, DASHBOARD_VIEWS } from '@/constants/dashboard';
  import CheckSuccessDialog from '@/components/Hosts/Checks/CheckSuccessDialog';
  import HostMiniCardView from '@/components/Dashboard/Hosts/HostMiniCardView';
  import AddFirstHostView from '@/components/Dashboard/Hosts/AddFirstHostView';
  import HostEventsDialog from '@/components/Dashboard/Hosts/HostEventsDialog';
  import DashboardPagination from '@/components/Dashboard/DashboardPagination';
  import HideHostDialog from '@/components/Dashboard/Hosts/HideHostDialog';
  import HostInventoryDialog from '@/components/Hosts/HostInventoryDialog';
  import AllHiddenView from '@/components/Dashboard/Hosts/AllHiddenView';
  import HostListView from '@/components/Dashboard/Hosts/HostListView';
  import { DashboardRefresherSymbol } from '@/constants/symbols';
  import AggregatedHostData from '@/models/AggregatedHostData';
  import SkeletonLoader from '@/components/App/SkeletonLoader';
  import { useRefresher } from '@/use/useRefresher';
  import AppWait from '@/components/App/AppWait';
  import useFilters from '@/mixins/useFilters';
  import Host from '@/models/Host';

  const { CARD_MEDIUM, CARD_MINI, LIST } = DASHBOARD_VIEWS;
  const DashboardRefresher = useRefresher(DashboardRefresherSymbol);

  export default {
    components: {
      CreateWebCheckWizardDialog,
      AggregatedMediumCardView,
      DashboardSettingsFlyOut,
      AggregatedEventsDialog,
      AggregatedMiniCardView,
      DashboardInnerToolBar,
      HostInventoryDialog,
      HostDashboardFooter,
      DashboardPagination,
      CheckSuccessDialog,
      AggregatedListView,
      HostMediumCardView,
      AddFirstHostView,
      HostEventsDialog,
      HostMiniCardView,
      HideHostDialog,
      SkeletonLoader,
      AllHiddenView,
      HostListView,
      AppWait
    },
    mixins: [useFilters],
    async fetch() {
      await this.filter();
    },
    data() {
      return {
        appliedFilters: [],
        filters: {
          ...Host.dashboardFilters,
        },
        aggregateBy: null,
        tags: [],
        groups: [],
      };
    },
    computed: {
      ...mapState('dashboard', [
        'hosts', 'totalHostCount', 'dashboardCounts',
        'hideHostDialog', 'eventsDialog', 'TVMode', 'webCheckWizardDialog'
      ]),
      ...mapState('events', ['deleteDialog']),
      ...mapState('subUnits', ['subUnits']),
      ...mapState('hosts', ['inventoryDialog', 'checkSuccessDialog']),
      ...mapState('appSettings', ['showMiniCharts']),
      showAddFirstHostView() {
        return this.totalHostCount === 0 && this.$auth.user.isNotReadOnly();
      },
      showAllHostsHiddenView() {
        // Team have hosts but none were returned from backend, likely because of filtering.
        return this.totalHostCount > 0 && this.dashboardCounts.items === 0;
      },
      showFilteredMessage() {
        return this.isAggregatedByGroup || this.isAggregatedBySubUnit || !! this.appliedFilters.length;
      },
      showPagination() {
        if (this.showAddFirstHostView) return false;
        if (this.showAllHostsHiddenView) return false;
        return true;
      },
      showSkeletonLoader() {
        return this.$fetchState.pending
               && ! this.$auth.team.isNewTeam
               && this.$auth.team.counts.hosts > 0;
      },
      isAggregatingData() {
        return this.aggregateBy;
      },
      hostViewTabClass() {
        return {
          'qa-view-empty': this.dashboardCounts.items === 0,
          'qa-view-tile': this.isMediumCardView,
          'qa-view-mini': this.isMiniCardView,
          'qa-view-list': this.isListView,
        };
      },
      hostViewComponent() {
        let lookup = {};
        if (this.isAggregatingData) {
          lookup = {
            [CARD_MEDIUM]: 'AggregatedMediumCardView',
            [CARD_MINI]: 'AggregatedMiniCardView',
            [LIST]: 'AggregatedListView',
          };
        } else {
          lookup = {
            [CARD_MEDIUM]: 'HostMediumCardView',
            [CARD_MINI]: 'HostMiniCardView',
            [LIST]: 'HostListView',
          };
        }
        return lookup[this.dashboardView];
      },
      dashboardFilters() {
        let filterItems = [];
        if (this.tags.length) {
          filterItems.push({ header: 'Host Tags' });
          filterItems.push(...this.tags.map((tag) => {
            return {
              text: tag,
              value: tag,
              type: 'tag'
            };
          }));
        }

        if (this.groups.length) {
          filterItems.push({ header: 'Host Groups' });
          filterItems.push(...this.groups.map((group) => {
            return {
              text: group,
              value: group,
              type: 'group',
              disabled: this.filters.group !== null
                        && this.filters.group !== group
                        && this.isAggregatingData
            };
          }));
        }

        if (this.$teamSettings.get('subUnitManagementEnabled') && this.subUnits.length) {
          filterItems.push({ header: 'Sub Units' });
          filterItems.push(...collect(this.subUnits).map((SubUnit) => {
            return {
              text: SubUnit.shortId,
              value: SubUnit.id,
              type: 'subUnit',
              disabled: this.filters.subUnit !== null
                        && this.filters.subUnit !== SubUnit.id,
            };
          }).values().all());
        }

        return filterItems;
      },
      isMediumCardView() {
        return this.dashboardView === CARD_MEDIUM;
      },
      isMiniCardView() {
        return this.dashboardView === CARD_MINI;
      },
      isListView() {
        return this.dashboardView === LIST;
      },
      dashboardView() {
        return this.$userSettings.dashboard.view;
      },
      showGroupingMenu() {
        return this.hasGroupHostTags || this.$teamSettings.get('subUnitManagementEnabled');
      },
      hasGroupHostTags() {
        return this.groups.length;
      },
      isAggregatedByGroup() {
        return this.aggregateBy === DASHBOARD_AGGREGATE_BY.GROUP;
      },
      isAggregatedBySubUnit() {
        return this.aggregateBy === DASHBOARD_AGGREGATE_BY.SUB_UNIT;
      },
    },
    watch: {
      '$userSettings.dashboard.shouldAutoRefresh': {
        handler(value) {
          if (value) {
            DashboardRefresher.start();
          } else {
            DashboardRefresher.stop();
          }
        },
        immediate: true,
      },
      '$userSettings.dashboard.refreshRate': {
        handler(rate) {
          DashboardRefresher.refreshRate = rate;
        },
        immediate: true,
      },
      '$userSettings.dashboard.showHostsWithIssuesOnly': {
        handler(withIssuesOnly) {
          this.filters.withIssuesOnly = withIssuesOnly;
        },
        immediate: true
      },
      TVMode(TVMode) {
        // When in TV mode we should continue to refresh the data,
        // even when the display may be not visible.
        DashboardRefresher.refreshWhenHidden = TVMode;
      },
      appliedFilters(filters) {
        if (! filters.length) {
          this.filters = {
            ...this.filters,
            tag: null,
            group: null,
            subUnit: null,
          };
          return;
        }

        filters = collect(filters)
          .groupBy('type')
          .map(groupedFilters => groupedFilters.pluck('value').join(','))
          .all();

        this.filters = {
          ...this.filters,
          tag: filters?.tag ?? null,
          group: filters?.group ?? null,
          subUnit: filters?.subUnit ?? null,
        };
      }
    },
    async created() {
      this.$bus.$on('dashboard:refresh', () => this.$fetch());
      DashboardRefresher.onRefresh(this.filter);
      this.tags = await Host.fetchActiveTags();
      this.groups = await Host.fetchActiveGroups();
      if (this.$teamSettings.get('subUnitManagementEnabled')) {
        await this.getSubUnits();
      }
    },
    beforeDestroy() {
      this.$bus.$off('dashboard:refresh');
      DashboardRefresher.stop();
    },
    methods: {
      ...mapActions('dashboard', ['getHosts', 'getAggregatedHostData']),
      ...mapActions('subUnits', ['getSubUnits']),
      ...mapMutations('dashboard', ['toggleWebCheckWizardDialog']),
      ...mapMutations('hosts', ['toggleCheckSuccessDialog']),
      async filter() {
        if (this.aggregateBy) {
          await this.getAggregatedHostData({
            AggregatedHostData: AggregatedHostData
              .filter(this.filters)
              .setAggregatedType(this.aggregateBy),
          });
        } else {
          await this.getHosts({
            Host: Host.filter(this.filters)
          });
        }
      },
      clearGroupsAndFilters() {
        this.appliedFilters = [];
        this.aggregateBy = null;
      },
      aggregateByGroup() {
        this.fetchAggregatedData(DASHBOARD_AGGREGATE_BY.GROUP);
      },
      groupBySubUnit() {
        this.fetchAggregatedData(DASHBOARD_AGGREGATE_BY.SUB_UNIT);
      },
      async fetchAggregatedData(aggregateBy) {
        if (this.aggregateBy === null || this.aggregateBy !== aggregateBy) {
          this.aggregateBy = aggregateBy;
        } else {
          this.aggregateBy = null;
        }
        this.setFilters({ page: 1 }, true);
        await this.$fetch();
      },
      onHideHostFromDashboard({ success, Host }) {
        if (success) {
          this.filter();
          let dashboard = Host.dashboard ? 'showHostOnDashboard' : 'hideHostOnDashboard';
          this.$flash.success(this.$t(`message.success.${dashboard}`, { name: Host.name }));
        } else {
          let dashboard = Host.dashboard ? 'hideHostOnDashboard' : 'showHostOnDashboard';
          this.$flash.error(this.$t(`message.error.${dashboard}`, { name: Host.name }));
        }
      },
      onCreateWebCheck({ success }) {
        if (success) {
          this.toggleWebCheckWizardDialog(false);
          this.toggleCheckSuccessDialog(true);
          this.$bus.$emit('dashboard:refresh');
          this.$flash.success(this.$t('message.success.webSiteMonitoringCreate'));
        }
      }
    },
  };
</script>

<style lang="stylus">
  .v-select .v-chip
    margin-bottom 0 !important
</style>
