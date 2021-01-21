import moment from 'moment';
import 'moment-timezone';

export default {
  data() {
    return {
      view: 'col3',
      dates: {
        from: null,
        to: null,
      },
      fromDateMenu: false,
      toDateMenu: false,
      durationAsHours: null,
    };
  },
  watch: {
    defaultFrom(newValue) {
      this.dates.from = this.setDate(newValue);
    },
    defaultTo(newValue) {
      this.dates.to = this.setDate(newValue);
    },
    'dates.from': function () {
      this.durationAsHours = this.getDurationAsHours();
      this.$emit('on-update-duration', this.durationAsHours);
    },
    'dates.to': function () {
      this.durationAsHours = this.getDurationAsHours();
      this.$emit('on-update-duration', this.durationAsHours);
    },
  },
  mounted() {
    this.dates.from = this.setDate(this.defaultFrom);
    this.dates.to = this.setDate(this.defaultTo);
    this.durationAsHours = this.getDurationAsHours();
    this.toggleChartHeight(this.view);
  },
  computed: {
    dataRetention() {
      return this.$auth.team.dataRetention;
    },
    timestampFrom() {
      return moment.tz(this.dates.from, this.timezone).utc().unix();
    },
    timestampTo() {
      return moment.tz(this.dates.to, this.timezone).utc().unix();
    },
    chartColClass() {
      switch (this.view) {
        case 'col3':
          return 'md4 sm6 xs12';
        case 'col2':
          return 'sm6 xs12';
        case 'full-narrow':
          return 'xs12 mb-5';
        case 'full':
          return 'xs12 mb-5';
        case 'full-without-margin':
          return 'xs12';
        default:
          return 'xs12 mb-5';
      }
    },
  },
  methods: {
    toggleChartHeight(view) {
      switch (view) {
        case 'col3':
          this.chartHeight = this.chartHeightXs;
          break;
        case 'col2':
          this.chartHeight = this.chartHeightSm;
          break;
        case 'full-narrow':
          this.chartHeight = this.chartHeightFlat;
          break;
        case 'full':
          this.chartHeight = this.chartHeightSm;
          break;
        case 'full-without-margin':
          this.chartHeight = this.chartHeightSm;
          break;
        default:
          this.chartHeight = this.chartHeightLg;
      }
    },
    onViewChange(view) {
      this.toggleChartHeight(view);
    },
    setDate(timestamp) {
      return moment.unix(timestamp).tz(this.timezone).format('YYYY-MM-DD HH:mm');
    },
    getDurationAsHours() {
      const from = moment(this.dates.from);
      const to = moment(this.dates.to);
      const diff = to.diff(from);

      return moment.duration(diff).asHours();
    },
    isFutureDate(date) {
      const currentDate = new Date();
      return date > currentDate;
    },
    isPriorToAllowableDate(date) {
      // disable all dates prior to dataRetention setting
      const earliestAllowedDate = moment().subtract(this.dataRetention, 'days').startOf('day');
      const dateFromPicker = moment(date);

      return dateFromPicker.diff(earliestAllowedDate) < 0;
    },
    disableFromDates(date) {
      if (this.isFutureDate(date) || this.isPriorToAllowableDate(date)) {
        return true;
      }

      // must be before the TO date
      const from = moment(date);
      const to = moment(this.dates.to).startOf('day');

      return from.diff(to) > 0;
    },
    disableToDates(date) {
      if (this.isFutureDate(date) || this.isPriorToAllowableDate(date)) {
        return true;
      }

      // must be later than the FROM date
      const from = moment(this.dates.from).startOf('day');
      const to = moment(date);

      return to.diff(from) < 0;
    },
  },
};
