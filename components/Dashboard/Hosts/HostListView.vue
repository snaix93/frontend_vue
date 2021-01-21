<template>
  <v-card>
    <table class="v-datatable v-table theme--light">
      <tbody>
        <DashboardListView
          v-for="Host in hosts"
          :key="Host.id"
          class="qa-list"
          data-qa="dashboard:host:list-item"
        >
          <template #title>
            <v-tooltip left>
              <div class="qa-name-full">
                {{ Host.name }}{{ Host.connect ? ` | ${Host.connect}` : '' }}
              </div>
              <div
                slot="activator"
                class="body-1 text-truncate qa-name"
              >
                <v-icon
                  class="mr-2"
                  small
                >
                  fas fa-hdd
                </v-icon>
                <nuxt-link
                  v-if="$auth.user.isNotReadOnly()"
                  :to="Host.settingsPath"
                  class="text--primary no-text-decoration"
                >
                  {{ Host.name }}
                </nuxt-link>
                <div v-else>
                  {{ Host.name }}
                </div>
              </div>
            </v-tooltip>
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
          <template #checks>
            <InfoBadge
              v-if="Host.totalCheckCount > 0"
              :number="Host.totalCheckCount"
              :title="$t('button.showEvents') | capitalize"
              color="grey"
              label-lang-key="dashboard.check"
              qa-class-name="qa-metric"
              size="small"
            />
            <InfoBadge
              v-if="Host.totalMetricCount > 0"
              :number="Host.totalMetricCount"
              :title="$t('button.showEvents') | capitalize"
              color="grey"
              label-lang-key="dashboard.metric"
              qa-class-name="qa-metric"
              size="small"
            />
            <div
              v-if="Host.hasLastCheckedAtDate"
              :class="{
                'qa-last_checked': Host.hasLastCheckedAtDate,
                'qa-never_checked': !Host.hasLastCheckedAtDate,
              }"
              class="d-inline caption grey--text text--darken-2"
            >
              <v-tooltip right>
                <div
                  slot="activator"
                  class="d-inline"
                >
                  <v-icon small>
                    fas fa-stopwatch
                  </v-icon>
                </div>
                <span class="qa-metric">{{ $t('dashboard.lastCheck') | capitalize }}: {{
                  `${lastCheckedAtLocalFormatted(Host)}`
                }}</span>
              </v-tooltip>
            </div>
          </template>
          <template #buttons>
            <v-tooltip v-if="false" top>
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
        </DashboardListView>
      </tbody>
    </table>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';
  import DashboardEventBadge from '@/components/Dashboard/DashboardEventBadge';
  import HostViewButtons from '@/components/Dashboard/Hosts/HostViewButtons';
  import DashboardListView from '@/components/Dashboard/DashboardListView';
  import InfoBadge from '@/components/Dashboard/InfoBadge';
  import dashboardMixin from '@/mixins/dashboard';
  import hostMixins from '@/mixins/host';
  import appMixins from '@/mixins/app';

  export default {
    components: {
      DashboardEventBadge,
      DashboardListView,
      HostViewButtons,
      InfoBadge,
    },
    mixins: [appMixins, hostMixins, dashboardMixin],
    computed: {
      ...mapState('dashboard', ['hosts']),
    },
    methods: {
      lastCheckedAtLocalFormatted(Host) {
        return Host.lastCheckedAtDate?.local?.formatted;
      }
    },
  };
</script>
