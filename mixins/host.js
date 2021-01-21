import { mapActions, mapMutations, mapState } from 'vuex';
import chartMixins from '@/mixins/chart';
import useDateTime from '@/mixins/useDateTime';
import userMixins from '@/mixins/user';

const hostCheckConsideredConnectedInSecs = 300;

export default {
  mixins: [
    useDateTime,
    chartMixins,
    userMixins,
  ],
  data() {
    return {
      chart: {
        cpuKey: 'cpu.util.idle.1.total',
        cpuParams: {},
        memKey: 'mem.available_percent',
        memParams: {
          subtractFrom: 100,
        },
        height: '40px',
        containerStyle: {
          width: '90px',
        },
        options: {
          animation: {
            duration: 0, // general animation time
          },
          hover: {
            animationDuration: 0, // duration of animations when hovering an item
          },
          responsiveAnimationDuration: 0, // animation duration after a resize
          elements: {
            line: {
              tension: 0, // disables bezier curves
            },
            radius: 1,
          },
          tooltips: {
            enabled: false,
          },
          scales: {
            xAxes: [
              {
                ticks: {
                  display: false,
                },
                time: {
                  unit: 'minute',
                  stepSize: 15,
                },
                gridLines: {
                  tickMarkLength: 2,
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  display: false,
                  stepSize: 25,
                  min: 0,
                  max: 100,
                },
                gridLines: {
                  tickMarkLength: 2,
                },
              },
            ],
          },
        },
      },
    };
  },
  computed: {
    ...mapState('hosts', {
      _Host: 'Host',
      _hosts: 'hosts',
    }),
    breadcrumbs() {
      return [
        {
          text: this.$options.filters.capitalize(this.$tc('host.name', 2)),
          disabled: false,
          href: '/hosts',
        },
        {
          text: this._Host.name,
          disabled: true,
          href: '',
        },
      ];
    },
    cAgentVersion() {
      try {
        const cAgentVersionStr = this._Host.inventory['cagent.version'];
        const result = /v([0-9]{1,4}\.[0-9]{1,4}(\.[0-9]{1,4})?)/gi.exec(cAgentVersionStr);
        return result[1];
      } catch (e) {
        return '0';
      }
    },
    host_countMaxExceeded() {
      return this.$auth.team.maxHosts !== 0 && this._hosts.length >= this.$auth.team.maxHosts;
    },
    host_hostsRemaining() {
      if (this.$auth.team.maxHosts < 999) {
        return this.$auth.team.maxHosts - this._hosts.length;
      }
      return false;
    },
  },
  methods: {
    ...mapMutations('dashboard', {
      _toggleHideHostDialog: 'toggleHideHostDialog',
      _toggleMiniGraphDialog: 'toggleMiniGraphDialog',
      _toggleFocusChartsDialog: 'toggleFocusChartsDialog',
      _setSelectedCharts: 'setSelectedCharts',
      _setDashboardHost: 'setHost',
    }),
    ...mapActions('hosts', {
      _nonAssignmentUpdate: 'nonAssignmentUpdate'
    }),
    host_goToHost(Host) {
      return this.$router.push(Host.settingsPath);
    },
    host_goToLatestData(Host) {
      return this.$router.push(Host.latestDataPath);
    },
    host_goToHostSettings(Host) {
      if (this.$auth.user.isNotReadOnly()) {
        this.$router.push(Host.settingsPath);
      }
    },
    host_goToCreateHost() {
      return this.$router.push('/hosts/create');
    },
    host_isHostCheckAlive(Host) {
      return this.getTimeDiffFromLastUpdate(
        Host.lastCheckedAtDate.timestamp, 'seconds'
      ) <= hostCheckConsideredConnectedInSecs;
    },
    // hostLastCheckTime(timestamp) {
    //   if (! this.$auth.team || ! this.$auth.team.timezone) return null;
    //
    //   const result = this.parseTimestampAsMomentObj(timestamp, this.$auth.team.timezone);
    //
    //   return result ? result.format('HH:mm') : '';
    // },
    host_showHostMiniGraphDialog(Host) {
      this._setDashboardHost(Host);
      this._toggleMiniGraphDialog();
    },
    host_showEventsDialog(Host) {
      this._setDashboardHost(Host);
      this._toggleHostEventsDialog(true);
    },
    async host_showHostInventory(Host) {
      await this.fetchById({ Host });
      this.$store.commit('hosts/showHostInventoryDialog');
    },
    async host_toggleAlerting(Host) {
      Host.muted = ! Host.alerting;
      await this._nonAssignmentUpdate({ Host });
      this.$flash.success(this.$t(
        `message.success.${Host.muted ? 'hostAlertingMuted' : 'hostAlertingActive'}`, {
          name: Host.name,
        },
      ));
    },
    async host_toggleDashboardVisibility(Host) {
      await this._nonAssignmentUpdate({ Host });
      this.$flash.success(this.$t(
        `message.success.${Host.dashboard ? 'showHostOnDashboard' : 'hideHostOnDashboard'}`, {
          name: Host.name,
        },
      ));
    },
    host_hideFromDashboard(Host) {
      this._setDashboardHost(Host);
      this._toggleHideHostDialog();
    },
    host_isVisibleOnDefaultDashboard(Host) {
      return Host.dashboard;
    },
    host_openFocusChartsDialog(Host, label, endpoint, params = {}) {
      this._setDashboardHost(Host);
      const selectedChart = {
        endpoint,
        label,
        params,
        options: {
          tooltips: {
            callbacks: {
              label: tooltipItem => this.chart_formatPercent(tooltipItem.yLabel),
            },
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  callback: value => this.chart_formatPercent(value),
                },
              },
            ],
          },
        },
        dataset: {
          global: {
            fill: false,
          },
          single: 'freeSpaceColoring',
        },
      };

      if (endpoint === 'cpu_utilization_total_percent') {
        selectedChart.options.legend = {
          tooltip: {
            preprocessor: this.chart_cpuTooltipPreprocessor,
          },
        };
      }

      this._setSelectedCharts([selectedChart]);
      this._toggleHideHostDialog(false);
      this._toggleFocusChartsDialog(true);
    },
  },
};
