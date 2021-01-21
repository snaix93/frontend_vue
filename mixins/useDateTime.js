import { mapState, mapMutations } from 'vuex';
import moment from 'moment';
import 'moment-timezone';
import momentDurationFormatSetup from 'moment-duration-format';

momentDurationFormatSetup(moment);

export default {
  computed: {
    ...mapState('app', ['lastUpdateTime']),
  },
  created() {
    moment.locale(this.$i18n.locale);
  },
  methods: {
    ...mapMutations('app', ['setLastUpdateTime']),
    endianFormatMap() {
      return [
        { endian: 'B-', dateFormat: 'Y-MM-DD', timeFormat: 'HH:mm:ss' },
        { endian: 'B.', dateFormat: 'Y.MM.DD', timeFormat: 'HH:mm:ss' },
        { endian: 'B_', dateFormat: 'Y MMMM DD', timeFormat: 'HH:mm:ss' },
        { endian: 'B/', dateFormat: 'Y/MM/DD', timeFormat: 'HH:mm:ss' },
        { endian: 'L-', dateFormat: 'DD-MM-Y', timeFormat: 'HH:mm:ss' },
        { endian: 'L.', dateFormat: 'DD.MM.Y', timeFormat: 'HH:mm:ss' },
        { endian: 'L_', dateFormat: 'DD MMMM Y', timeFormat: 'HH:mm:ss' },
        { endian: 'L/', dateFormat: 'DD/MM/Y', timeFormat: 'HH:mm:ss' },
        { endian: 'M_', dateFormat: 'MMMM DD Y', timeFormat: 'HH:mm:ss' },
        { endian: 'M/', dateFormat: 'MM/DD/Y', timeFormat: 'HH:mm:ss' },
      ].map((item) => {
        item.format = `${item.dateFormat} ${item.timeFormat}`;
        return item;
      });
    },
    getFormatForEndian(endianFormat = null) {
      endianFormat = endianFormat || this.$auth.team?.dateFormat;
      let result = this.endianFormatMap().find(({ endian }) => endian === endianFormat);

      result.localizedFormat = result.format;

      if (this.$i18n.locale === 'de') {
        result.localizedFormat = result.localizedFormat.replace(/D/g, 'T');
        result.localizedFormat = result.localizedFormat.replace(/Y/g, 'J');
      }

      return result;
    },
    /**
     * Defaults to moment object of NOW() for user TZ and the user set dateFormat.
     *
     * @param moment
     * @param endianFormat
     * @param includeTime
     * @returns {*}
     */
    parseEndianFormatFromMoment(moment = null, endianFormat = null, includeTime = true) {
      const { format: fullFormat, dateFormat } = this.getFormatForEndian(endianFormat);
      let format = dateFormat;
      if (includeTime) {
        format = fullFormat;
      }

      if (! moment) {
        moment = this.parseTimestampAsMomentObj(
          this.timestampNowExact(),
          this.$auth.user.team.timezone,
        );
      }

      return moment.format(format);
    },
    parseTimestampAsMomentObj(timestamp, timezone) {
      let result;
      if (isNaN(timestamp)) {
        result = moment(timestamp);
      } else {
        result = moment.unix(parseInt(timestamp));
      }

      result = result.utc();

      return result.clone().tz(timezone);
    },
    parseTimestampAsUtcMoment(timestamp) {
      return moment.unix(timestamp).utc();
    },
    parseStringAsMomentObj(timestamp, timezone) {
      const result = moment(timestamp).utc();

      return result.clone().tz(timezone);
    },
    getTimeDiffBetweenTwoUtcMoments(timestamp1, timestamp2, diffReturnFormat = null) {
      const utcMoment1 = this.parseTimestampAsUtcMoment(timestamp1);
      const utcMoment2 = this.parseTimestampAsUtcMoment(timestamp2);
      return utcMoment1.diff(utcMoment2, diffReturnFormat);
    },
    getTimeDiffFromLastUpdate(timestamp, diffReturnFormat = null) {
      if (! this.$auth?.team?.timezone) return null;

      if (! this.lastUpdateTime) {
        this.setLastUpdateTime(moment().utc().tz(this.$auth.user.team.timezone));
      }

      const event = this.parseTimestampAsMomentObj(timestamp, this.$auth.user.team.timezone);

      return this.lastUpdateTime.diff(event, diffReturnFormat);
    },
    getTimeDiffFromNow(timestamp, diffReturnFormat = null) {
      if (! this.$auth.user.team || ! this.$auth.user.team.timezone) return null;

      const now = moment().utc().tz(this.$auth.user.team.timezone);
      const event = this.parseTimestampAsMomentObj(timestamp, this.$auth.user.team.timezone);

      return now.diff(event, diffReturnFormat);
    },
    formattedDateTime(timestamp, format = null) {
      if (! this.$auth.user.team || ! this.$auth.user.team.timezone) return null;

      const moment = this.parseTimestampAsMomentObj(timestamp, this.$auth.user.team.timezone);

      if (format) {
        return moment.format(format);
      }

      return this.parseEndianFormatFromMoment(moment, this.$auth.user.team.dateFormat);
    },
    formattedDate(timestamp) {
      if (! this.$auth.user.team || ! this.$auth.user.team.timezone) return null;

      const moment = this.parseTimestampAsMomentObj(timestamp, this.$auth.user.team.timezone);

      return this.parseEndianFormatFromMoment(moment, this.$auth.user.team.dateFormat, false);
    },
    formattedTime(timestamp) {
      if (! this.$auth.user.team || ! this.$auth.user.team.timezone) return null;

      const result = this.parseTimestampAsMomentObj(timestamp, this.$auth.user.team.timezone);

      return result.format('HH:mm:ss');
    },
    timeAgo(timestamp) {
      if (! this.$auth.user.team || ! this.$auth.user.team.timezone) return null;

      const result = this.parseTimestampAsMomentObj(timestamp, this.$auth.user.team.timezone);

      return result.fromNow();
    },
    timeAgoDetailed(timestamp) {
      if (! this.$auth.user.team || ! this.$auth.user.team.timezone) return null;

      const diff = this.getTimeDiffFromNow(timestamp);
      const diffDuration = moment.duration(diff);

      const days = diffDuration.days() > 0 ? `${diffDuration.days()}d ` : '';
      const hours = diffDuration.hours() > 0 ? `${diffDuration.hours()}h ` : '';
      const minutes = diffDuration.minutes() > 0 ? `${diffDuration.minutes()}m ` : '';
      const seconds = diffDuration.seconds() > 0 ? `${diffDuration.seconds()}s` : '';

      return days + hours + minutes + seconds;
    },
    timeAgoDaily(timestamp) {
      const moment = this.parseTimestampAsMomentObj(timestamp, this.$auth.user.team.timezone);
      const fromNow = this.timeAgo(timestamp);

      return moment.calendar(null, {
        lastWeek: '[last] dddd',
        lastDay: '[yesterday]',
        sameDay: '[today]',
        sameElse() {
          return `[${fromNow}]`;
        },
      });
    },
    secondsToTime(seconds) {
      let format = '';

      if (seconds >= 86400) format += 'd[d] ';

      format += 'h[h] m[m] s[s]';

      return moment.duration(seconds, 'seconds').format(format);
    },
    timestampNow() {
      return moment()
        .seconds(0)
        .add(1, 'minute')
        .utc()
        .unix();
    },
    timestampNowSubtract(amount, unit) {
      return moment()
        .seconds(0)
        .add(1, 'minute')
        .subtract(amount, unit)
        .utc()
        .unix();
    },
    timestampNowExact() {
      return moment()
        .utc()
        .unix();
    },
    readableTime(value) {
      let result = '';

      value = parseInt(value || 0);

      if (value > 90) {
        value = Math.round(value / 60);

        result = `${String(value)} ${this.$t('phrase.min')}`;
      } else {
        result = `${String(value)} ${this.$t('phrase.sec')}`;
      }

      return result;
    },
    readableTimeLong(value) {
      const result = [];

      value = parseInt(value);

      const sec = value % 60;

      const min = ((value - sec) / 60) % 60;
      const hours = Math.floor((value - sec) / 60 / 60);

      if (hours) result.push(`${hours} ${this.$tc('phrase.hour', hours)}`);

      if (min) result.push(`${min} ${this.$tc('phrase.minute', min)}`);

      if (sec) result.push(`${sec} ${this.$tc('phrase.second', sec)}`);

      return result.join(' ');
    },
  },
};
