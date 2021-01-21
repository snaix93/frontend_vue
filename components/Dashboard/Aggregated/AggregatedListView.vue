<template>
  <v-card>
    <table class="v-datatable v-table theme--light">
      <tbody>
      <DashboardListView
        v-for="AggregatedHostData in aggregatedData"
        :key="AggregatedHostData.groupedEntity"
        class="qa-list"
        data-qa="dashboard:host:aggregated:list-item"
      >
        <template #title>
          <v-tooltip left>
            <div
              slot="activator"
              class="body-1 text-truncate qa-name"
            >
              <v-icon
                class="mr-2"
                small
              >
                fas fa-layer-group
              </v-icon>
              <span v-html="AggregatedHostData.renderTitle()"/>
            </div>
            <div
              class="qa-name-full"
              v-html="AggregatedHostData.renderTitle()"
            />
          </v-tooltip>
        </template>
        <template #badges>
          <DashboardEventBadge
            :events-count="!!AggregatedHostData.alerts ? AggregatedHostData.alerts : 0"
            :title="$t('button.showEvents') | capitalize"
            has-events-color="error"
            label-lang-key="dashboard.alerts"
            no-events-color="success"
            qa-class-name="qa-alerts"
            size="small"
            @eb-click="dashboard_showAggregatedEventsDialog(AggregatedHostData)"
          />

          <DashboardEventBadge
            :events-count="!!AggregatedHostData.warnings ? AggregatedHostData.warnings : 0"
            :title="$t('button.showEvents') | capitalize"
            has-events-color="warning"
            label-lang-key="dashboard.warnings"
            no-events-color="success"
            qa-class-name="qa-warnings"
            size="small"
            @eb-click="dashboard_showAggregatedEventsDialog(AggregatedHostData)"
          />

          <InfoBadge
            v-if="AggregatedHostData.connectedAgents"
            :number="AggregatedHostData.connectedAgents"
            color="success"
            label-lang-key="dashboard.connected"
            qa-class-name="qa-connected"
            size="small"
          />

          <InfoBadge
            v-if="AggregatedHostData.disconnectedAgents"
            :number="AggregatedHostData.disconnectedAgents"
            color="warning highlight"
            label-lang-key="dashboard.disconnected"
            qa-class-name="qa-disconnected"
            size="small"
          />
        </template>
        <template #checks>
          <InfoBadge
            v-if="AggregatedHostData.numberOfHosts > 0"
            :number="AggregatedHostData.numberOfHosts"
            :title="$tc('dashboard.host', AggregatedHostData.numberOfHosts) | capitalize"
            color="grey"
            label-lang-key="dashboard.host"
            qa-class-name="qa-host"
            size="small"
          />
          <InfoBadge
            v-if="AggregatedHostData.numberOfChecks > 0"
            :number="AggregatedHostData.numberOfChecks"
            :title="$tc('dashboard.checkHint', AggregatedHostData.numberOfHosts) | capitalize"
            color="grey"
            label-lang-key="dashboard.check"
            qa-class-name="qa-checks"
            size="small"
          />
          <InfoBadge
            v-if="AggregatedHostData.numberOfMetrics > 0"
            :number="AggregatedHostData.numberOfMetrics"
            :title="$t('dashboard.metricHint') | capitalize"
            color="grey"
            label-lang-key="dashboard.metric"
            qa-class-name="qa-cagent-metrics"
            size="small"
          />
        </template>
        <template #buttons>
          <v-btn
            :title="$t('button.showEvents') | capitalize"
            color="secondary"
            flat
            icon
            small
            @click="dashboard_showAggregatedEventsDialog(AggregatedHostData)"
          >
            <v-icon small>
              fas fa-exclamation-triangle
            </v-icon>
          </v-btn>
        </template>
      </DashboardListView>
      </tbody>
    </table>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';
  import DashboardListView from '@/components/Dashboard/DashboardListView';
  import DashboardEventBadge from '@/components/Dashboard/DashboardEventBadge';
  import InfoBadge from '@/components/Dashboard/InfoBadge';
  import dashboardMixin from '@/mixins/dashboard';

  export default {
    components: {
      DashboardEventBadge,
      DashboardListView,
      InfoBadge,
    },
    mixins: [dashboardMixin],
    computed: {
      ...mapState('dashboard', ['aggregatedData']),
    },
  };
</script>
