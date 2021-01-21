<template>
  <v-layout wrap>
    <v-flex
      v-for="Host in hosts"
      :key="Host.id"
      class="qa-card"
      data-qa="dashboard:host:mini-card"
      lg4 sm6 xl3 xs12
    >
      <DashboardMiniCard :metrics="metrics(Host)">
        <template #title>
          <v-flex xs8>
            <v-tooltip left>
              <span class="qa-name-full">{{ Host.name }}{{ Host.connect ? ` | ${Host.connect}` : '' }}</span>
              <div
                slot="activator"
                class="subheading text-truncate d-block qa-name"
              >
                <nuxt-link
                  v-if="$auth.user.isNotReadOnly()"
                  :to="Host.settingsPath"
                  class="text--primary no-text-decoration"
                >
                  {{ Host.name }}
                </nuxt-link>
                <span v-else>
                  {{ Host.name }}
                </span>
              </div>
            </v-tooltip>
          </v-flex>
          <v-flex
            v-if="false"
            align-self-end
            class="text-xs-right"
            grow
          >
            <v-tooltip top>
              <v-btn
                slot="activator"
                :disabled="!Host.hasCharts"
                class="ma-0"
                color="secondary"
                flat
                icon
                small
                @click="host_showHostMiniGraphDialog(Host)"
              >
                <v-icon small>
                  far fa-chart-bar
                </v-icon>
              </v-btn>
              <span>{{ $t('host.graphsQuickView') | capitalize }}</span>
            </v-tooltip>
          </v-flex>
        </template>

        <template #badges>
          <InfoBadge
            v-if="Host.hasPendingConnection || Host.hasPendingAgentOnlyConnection"
            :title="$auth.user.isReadOnly() ? '' : $t('button.goToHostSettings') | capitalize"
            color="warning"
            label-lang-key="dashboard.monitoringPending"
            qa-class-name="qa-pending"
            size="small"
            @ib-click="host_goToHostSettings(Host)"
          />
          <InfoBadge
            v-else-if="Host.totalCheckCount < 1"
            :title="$auth.user.isReadOnly() ? '' : $t('button.goToHostSettings') | capitalize"
            color="grey"
            label-lang-key="dashboard.notMonitored"
            qa-class-name="qa-not-monitored"
            size="small"
            @ib-click="host_goToHostSettings(Host)"
          />
          <template v-else>
            <template v-if="Host.hasEventSummary">
              <DashboardEventBadge
                :events="Host.eventSummary.alerts"
                :title="$t('button.showEvents') | capitalize"
                has-events-color="error"
                label-lang-key="dashboard.alerts"
                no-events-color="success"
                qa-class-name="qa-alerts"
                size="small"
                @eb-click="dashboard_showHostEventsDialog(Host)"
              />

              <DashboardEventBadge
                :events="Host.eventSummary.warnings"
                :title="$t('button.showEvents') | capitalize"
                has-events-color="warning"
                label-lang-key="dashboard.warnings"
                no-events-color="success"
                qa-class-name="qa-warnings"
                size="small"
                @eb-click="dashboard_showHostEventsDialog(Host)"
              />
            </template>

            <InfoBadge
              v-if="!host_isHostCheckAlive(Host)"
              :title="$auth.user.isReadOnly() ? '' : $t('button.goToHostSettings') | capitalize"
              color="warning highlight"
              label-lang-key="dashboard.disconnected"
              qa-class-name="qa-disconnected"
              size="small"
              @ib-click="host_goToHostSettings(Host)"
            />
          </template>
        </template>

        <template #buttons>
          <v-menu
            left
            nudge-left="4px"
            nudge-top="6px"
            offset-x
          >
            <v-btn
              slot="activator"
              icon
              small
            >
              <v-icon>more_vert</v-icon>
            </v-btn>

            <div class="white">
              <HostViewButtons
                :Host="Host"
                :small="true"
              />
            </div>
          </v-menu>
        </template>
      </DashboardMiniCard>
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapState } from 'vuex';
  import DashboardEventBadge from '@/components/Dashboard/DashboardEventBadge';
  import HostViewButtons from '@/components/Dashboard/Hosts/HostViewButtons';
  import DashboardMiniCard from '@/components/Dashboard/DashboardMiniCard';
  import InfoBadge from '@/components/Dashboard/InfoBadge';
  import dashboardMixin from '@/mixins/dashboard';
  import hostMixins from '@/mixins/host';

  export default {
    components: {
      DashboardEventBadge,
      DashboardMiniCard,
      HostViewButtons,
      InfoBadge,
    },
    mixins: [hostMixins, dashboardMixin],
    computed: {
      ...mapState('dashboard', ['hosts']),
      // ...mapState('appSettings', ['showMiniCharts']),
      showMiniCharts() {
        // temp - hard false to avoid persisted settings
        return false;
      }
    },
    methods: {
      metrics(Host) {
        const lastCheckedAt = Host.lastCheckedAtDate?.local?.formatted;

        const metrics = [{
          qaRootClass: Host.connect ? 'qa-checks' : 'qa-checks-no-connect',
          value: Host.totalCheckCount,
          metric: this.$tc('dashboard.check', Host.totalCheckCount),
          text: this.$t('dashboard.checkHint'),
        }];

        if (Host.hasMonitoringAgent) {
          metrics.push({
            qaRootClass: 'qa-cagent-metrics',
            value: Host.totalMetricCount,
            metric: this.$tc('dashboard.metric', Host.totalMetricCount),
            text: this.$t('dashboard.metricHint'),
          });
        }

        metrics.push({ spacer: true });

        metrics.push({
          qaRootClass: lastCheckedAt ? 'qa-last_checked' : 'qa-never_checked',
          value: '',
          metric: lastCheckedAt ? `${lastCheckedAt}` : this.$t('dashboard.neverChecked'),
          text: this.$t('dashboard.lastCheck'),
        });

        return metrics;
      },
    },
  };
</script>
