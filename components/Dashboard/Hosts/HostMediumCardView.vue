<template>
  <v-layout wrap>
    <v-flex
      v-for="Host in hosts"
      :key="Host.id"
      class="qa-card"
      data-qa="dashboard:host:medium-card"
      lg6 xl4 xs12
    >
      <DashboardMediumCard :metrics="metrics(Host)">
        <template #title>
          <v-flex xs6>
            <v-tooltip left>
              <div
                slot="activator"
                :data-cy="Host.name"
                class="headline text-truncate qa-name"
              >
                <nuxt-link
                  v-if="$auth.user.isNotReadOnly"
                  :to="Host.settingsPath"
                  class="text--primary no-text-decoration"
                >
                  {{ Host.name }}
                </nuxt-link>
                <div v-else>
                  {{ Host.name }}
                </div>
              </div>
              <div class="qa-name-full">
                {{ Host.name }}
              </div>
            </v-tooltip>
          </v-flex>
          <v-spacer/>
          <v-flex
            class="text-xs-right"
            xs4
          >
            <v-tooltip right>
              <div
                slot="activator"
                class="subheading text-truncate qa-ip"
              >
                {{ Host.connect }}
              </div>
              <div class="qa-ip-full">
                {{ Host.connect }}
              </div>
            </v-tooltip>
          </v-flex>
          <v-flex
            v-if="false"
            class="pl-2 pr-0 text-xs-right"
            shrink
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
          <v-flex
            v-if="host_isVisibleOnDefaultDashboard(Host) && $auth.user.isNotReadOnly"
            class="text-xs-right"
            shrink
          >
            <v-tooltip top>
              <v-btn
                slot="activator"
                class="ma-0 pa-0 qa-remove-dash"
                icon
                small
                @click="host_hideFromDashboard(Host)"
              >
                <v-icon
                  color="grey"
                  small
                >
                  fas fa-times
                </v-icon>
              </v-btn>
              <span>{{ $t('host.hideFromDashboard') | capitalize }}</span>
            </v-tooltip>
          </v-flex>
        </template>
        <template #charts>
          <template v-if="showMiniCharts">
            <v-flex v-if="Host.hasCharts">
              <v-layout
                :justify-end="$vuetify.breakpoint.smAndUp"
                :justify-start="$vuetify.breakpoint.xsOnly"
                row
              >
                <v-flex
                  class="open-chart mx-1 mb-1"
                  shrink
                  @click="host_openFocusChartsDialog(
                    Host, $t('phrase.cpu'), 'cpu_utilization_total_percent'
                  )"
                >
                  <Chart
                    :chart-options="chart.options"
                    :container-style="chart.containerStyle"
                    :endpoint="chart.cpuKey"
                    :fill-height="false"
                    :height="chart.height"
                    :hide-no-data-message="true"
                    :host-uuid="Host.id"
                    class="ma-0 pt-2 px-2"
                    custom-legend
                    hide-points
                    single-key
                  >
                    <template #legend-title>
                      <span class="caption">{{ $t('phrase.cpu') }}</span>
                    </template>
                    <template #legend-unit>
                      <span>%</span>
                    </template>
                  </Chart>
                </v-flex>
                <v-flex
                  class="open-chart ml-1 mb-1"
                  shrink
                  @click="
                    host_openFocusChartsDialog(
                      Host,
                      $t('phrase.memory'),
                      'memory_usage_percent'
                    )
                  "
                >
                  <Chart
                    :chart-options="chart.options"
                    :container-style="chart.containerStyle"
                    :endpoint="chart.memKey"
                    :fill-height="false"
                    :height="chart.height"
                    :hide-no-data-message="true"
                    :host-uuid="Host.id"
                    :params="chart.memParams"
                    class="ma-0 pt-2 px-2"
                    custom-legend
                    hide-points
                    single-key
                  >
                    <template #legend-title>
                      <span class="caption">{{ $t('phrase.memory') | capitalize }}</span>
                    </template>
                    <template #legend-unit>
                      <span>%</span>
                    </template>
                  </Chart>
                </v-flex>
              </v-layout>
            </v-flex>
          </template>
        </template>
        <template #badges>
          <InfoBadge
            v-if="Host.hasPendingConnection || Host.hasPendingAgentOnlyConnection"
            :title="$auth.user.isReadOnly() ? '' : $t('button.goToHostSettings') | capitalize"
            color="warning"
            label-lang-key="dashboard.monitoringPending"
            qa-class-name="qa-pending"
            @ib-click="host_goToHostSettings(Host)"
          />
          <InfoBadge
            v-else-if="Host.totalCheckCount < 1"
            :title="$auth.user.isReadOnly() ? '' : $t('button.goToHostSettings') | capitalize"
            color="grey"
            label-lang-key="dashboard.notMonitored"
            qa-class-name="qa-not-monitored"
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
                @eb-click="dashboard_showHostEventsDialog(Host)"
              />
              <DashboardEventBadge
                :events="Host.eventSummary.warnings"
                :title="$t('button.showEvents') | capitalize"
                has-events-color="warning"
                label-lang-key="dashboard.warnings"
                no-events-color="success"
                qa-class-name="qa-warnings"
                @eb-click="dashboard_showHostEventsDialog(Host)"
              />
            </template>
            <InfoBadge
              v-if="!host_isHostCheckAlive(Host)"
              :title="$auth.user.isReadOnly() ? '' : $t('button.goToHostSettings') | capitalize"
              color="warning highlight"
              label-lang-key="dashboard.disconnected"
              qa-class-name="qa-disconnected"
              @ib-click="host_goToHostSettings(Host)"
            />
          </template>
        </template>
        <template #buttons>
          <HostViewButtons
            :Host="Host"
            :show-hide-dashboard-button="false"
            class="px-0 shrink"
          />
        </template>
      </DashboardMediumCard>
    </v-flex>
  </v-layout>
</template>

<script>
  import { mapState } from 'vuex';
  import DashboardMediumCard from '@/components/Dashboard/DashboardMediumCard';
  import HostViewButtons from '@/components/Dashboard/Hosts/HostViewButtons';
  import DashboardEventBadge from '@/components/Dashboard/DashboardEventBadge';
  import Chart from '@/components/Hosts/Measurements/Chart';
  import InfoBadge from '@/components/Dashboard/InfoBadge';
  import dashboardMixin from '@/mixins/dashboard';
  import hostMixins from '@/mixins/host';

  export default {
    components: {
      DashboardMediumCard,
      DashboardEventBadge,
      HostViewButtons,
      InfoBadge,
      Chart,
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

        const lastCheckedAt = Host.lastCheckedAtDate?.local?.formatted;
        return [metrics, [
          {
            qaRootClass: lastCheckedAt ? 'qa-last_checked' : 'qa-never_checked',
            value: '',
            metric: lastCheckedAt ? `${lastCheckedAt}` : this.$t('dashboard.neverChecked'),
            text: this.$t('dashboard.lastCheck'),
          },
        ]];
      },
    },
  };
</script>
