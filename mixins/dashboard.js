import { mapMutations } from 'vuex';

export default {
  methods: {
    ...mapMutations('dashboard', {
      _toggleEventsDialog: 'toggleEventsDialog',
      _setDashboardHost: 'setHost',
      _setAggregatedHostData: 'setAggregatedHostData',
    }),
    dashboard_showHostEventsDialog(Host) {
      this._setDashboardHost(Host);
      this._toggleEventsDialog(true);
    },
    dashboard_showAggregatedEventsDialog(AggregatedHostData) {
      this._setAggregatedHostData(AggregatedHostData);
      this._toggleEventsDialog(true);
    },
  },
};
