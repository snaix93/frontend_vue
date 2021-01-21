const PRIMARY_COLOR = 'secondary';
const WARNING_COLOR = 'warning';
const ERROR_COLOR = 'error';

export default {
  methods: {
    severityColor({alerts, warnings}) {
      let result = PRIMARY_COLOR;

      if(warnings?.length)
        result = WARNING_COLOR;

      if(alerts?.length)
        result = ERROR_COLOR;

      return result;
    },
    severityCounter({alerts, warnings, measurements, modulesCount}, includeEmptyAlertsAndWarnings=false) {
      const result = [];

      if(!!modulesCount)
        result
          .push(`<span>${modulesCount} ${this.$tc('host.modules.module', modulesCount)}</span>`);

      const measurementsCount = Object.keys(measurements).length;
      if(!!measurementsCount)
        result
          .push(`<span>${measurementsCount} ${this.$tc('host.modules.measurement', measurementsCount)}</span>`);

      if(
        !!includeEmptyAlertsAndWarnings
        || alerts?.length
      ) {
        const alertClass = alerts?.length ? `${ERROR_COLOR}--text` : '';
        result
          .push(`<span class="${alertClass}">${alerts.length} ${this.$tc('host.modules.alerts', alerts.length)}</span>`);
      }

      if(
        !!includeEmptyAlertsAndWarnings
        || warnings?.length
      ) {
        const warningClass = warnings?.length ? `${WARNING_COLOR}--text` : '';
        result
          .push(`<span class="${warningClass}">${warnings.length} ${this.$tc('host.modules.warnings', warnings.length)}</span>`);
      }


      return result.join(', ');
    }
  }
};
