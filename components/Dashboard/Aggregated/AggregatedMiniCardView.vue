<template>
  <v-layout wrap>
    <v-flex
      v-for="(AggregatedHostData, key) in aggregatedData"
      :key="key"
      class="qa-card"
      data-qa="dashboard:host:aggregated:mini-card"
      sm6 xl3 xs12
    >
      <DashboardMiniCard :metrics="metrics(AggregatedHostData)">
        <template #title>
          <v-flex xs8>
            <v-tooltip left>
              <div
                slot="activator"
                class="subheading text-truncate qa-name"
                v-html="AggregatedHostData.renderTitle()"
              />
              <div
                class="qa-name-full"
                v-html="AggregatedHostData.renderTitle()"
              />
            </v-tooltip>
          </v-flex>
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
      </DashboardMiniCard>
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapState } from 'vuex';
  import DashboardEventBadge from '@/components/Dashboard/DashboardEventBadge';
  import DashboardMiniCard from '@/components/Dashboard/DashboardMiniCard';
  import InfoBadge from '@/components/Dashboard/InfoBadge';
  import dashboardMixin from '@/mixins/dashboard';

  export default {
    components: {
      DashboardEventBadge,
      DashboardMiniCard,
      InfoBadge,
    },
    mixins: [dashboardMixin],
    computed: {
      ...mapState('dashboard', ['aggregatedData']),
    },
    methods: {
      metrics(AggregatedHostData) {
        return [
          {
            qaRootClass: 'qa-host',
            value: AggregatedHostData.numberOfHosts,
            metric: this.$tc('dashboard.host', AggregatedHostData.numberOfHosts),
            text: this.$tc('dashboard.host', AggregatedHostData.numberOfHosts),
          },
          {
            qaRootClass: 'qa-checks',
            value: AggregatedHostData.numberOfChecks,
            metric: this.$tc('dashboard.check', AggregatedHostData.numberOfChecks),
            text: this.$t('dashboard.checkHint'),
          },
          {
            qaRootClass: 'qa-cagent-metrics',
            value: AggregatedHostData.numberOfMetrics,
            metric: this.$tc('dashboard.metric', AggregatedHostData.numberOfMetrics),
            text: this.$t('dashboard.metricHint'),
          },
        ];
      },
    },
  };
</script>
