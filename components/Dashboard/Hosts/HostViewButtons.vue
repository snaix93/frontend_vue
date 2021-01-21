<template>
  <v-flex>
    <v-btn
      v-if="Host.lastCheckedAtDate && Host.hasEventSummary"
      :small="small"
      :title="$t('button.showEvents') | capitalize"
      color="secondary"
      flat
      icon
      @click="dashboard_showHostEventsDialog(Host)"
    >
      <v-icon small>
        fas fa-exclamation-triangle
      </v-icon>
    </v-btn>

    <v-btn
      v-if="Host.hasMonitoringAgent && !Host.hasPendingConnection"
      :small="small"
      :title="$t('button.hostInventory') | capitalize"
      color="secondary"
      flat
      icon
      @click="showHostInventory(Host)"
    >
      <v-icon :small="small">
        cast
      </v-icon>
    </v-btn>

    <v-btn
      v-if="!Host.hasPendingConnection && (Host.hasMonitoringAgent || Host.lastCheckedAtDate)"
      :small="small"
      :title="$t('button.goToLatestData') | capitalize"
      :to="Host.latestDataPath"
      color="secondary"
      flat
      icon
    >
      <v-icon :small="small">
        bar_chart
      </v-icon>
    </v-btn>

    <template v-if="$auth.user.isNotReadOnly()">
      <v-btn
        v-if="Host.totalCheckCount === 0"
        :small="small"
        :title="$t('button.goToHostSettings') | capitalize"
        :to="Host.settingsPath"
        depressed
      >
        <v-icon :small="small" left>
          add
        </v-icon>
        {{ $t('dashboard.addCheck') | capitalize }}
      </v-btn>

      <v-btn
        :small="small"
        :title="$t('button.goToHostSettings') | capitalize"
        color="secondary"
        flat
        icon
        @click="host_goToHost(Host)"
      >
        <v-icon :small="small">
          settings
        </v-icon>
      </v-btn>

      <v-btn
        v-if="showHideDashboardButton && host_isVisibleOnDefaultDashboard(Host)"
        :small="small"
        :title="$t('button.hideOnDefaultDashboard') | capitalize"
        color="secondary"
        flat
        icon
        @click="host_hideFromDashboard(Host)"
      >
        <v-icon :small="small">
          fas fa-eye-slash
        </v-icon>
      </v-btn>
    </template>
  </v-flex>
</template>

<script>
  import { mapMutations } from 'vuex';
  import dashboardMixin from '@/mixins/dashboard';
  import hostMixins from '@/mixins/host';
  import Host from '@/models/Host';

  export default {
    mixins: [hostMixins, dashboardMixin],
    props: {
      Host: {
        type: Host,
        required: true,
      },
      small: {
        type: Boolean,
        required: false,
        default: false,
      },
      showHideDashboardButton: {
        type: Boolean,
        required: false,
        default: true
      },
    },
    methods: {
      ...mapMutations('hosts', ['setHost', 'toggleInventoryDialog']),
      showHostInventory(Host) {
        this.setHost(Host);
        this.toggleInventoryDialog();
      }
    },
  };
</script>

<style scoped>

</style>
