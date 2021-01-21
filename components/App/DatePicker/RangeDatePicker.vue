<template>
  <v-layout wrap>
    <v-flex class="pr-1">
      <v-menu
        ref="menu1"
        v-model="fromDateMenu"
        :close-on-content-click="false"
        lazy
        transition="scale-transition"
        offset-y
        full-width
        max-width="300px"
        min-width="300px"
        class="datetimepickers"
      >
        <v-text-field
          slot="activator"
          v-model="dates.from"
          :label="$t('charts.from') | capitalize"
          persistent-hint
          hide-details
          readonly
        />
        <date-pick
          v-model="dates.from"
          class="d-block"
          :has-input-element="false"
          :pick-time="true"
          :format="'YYYY-MM-DD HH:mm'"
          :is-date-disabled="disableFromDates"
          @input="onInput"
        />
      </v-menu>
    </v-flex>
    <v-flex class="px-1">
      <v-menu
        ref="menu2"
        v-model="toDateMenu"
        :close-on-content-click="false"
        lazy
        transition="scale-transition"
        offset-y
        full-width
        max-width="300px"
        min-width="300px"
        class="datetimepickers"
      >
        <v-text-field
          slot="activator"
          v-model="dates.to"
          :label="$t('charts.to') | capitalize"
          persistent-hint
          hide-details
          readonly
        />
        <date-pick
          v-model="dates.to"
          class="d-block"
          :has-input-element="false"
          :pick-time="true"
          :format="'YYYY-MM-DD HH:mm'"
          :is-date-disabled="disableToDates"
          @input="onInput"
        />
      </v-menu>
    </v-flex>
  </v-layout>
</template>

<script>
  import DatePick from 'vue-date-pick';
  import 'vue-date-pick/dist/vueDatePick.css';
  import useDateTime from '@/mixins/useDateTime';

  import moment from 'moment';
  import 'moment-timezone';

  export default {
    components: {
      DatePick
    },
    mixins: [
      useDateTime,
    ],
    props: {
      defaultFrom: {
        type: Number,
        required: false,
      },
      defaultTo: {
        type: Number,
        required: false,
      }
    },
    data() {
      return {
        dates: {
          from: null,
          to: null,
        },
        fromDateMenu: false,
        toDateMenu: false,
      }
    },
    computed: {
      teamDataRetention() {
        return this.$auth.team.dataRetention;
      },
      teamTimezone() {
        return this.$auth.team.timezone;
      },
      timestampFrom() {
        return moment.tz(this.dates.from, this.teamTimezone).utc().unix();
      },
      timestampTo() {
        return moment.tz(this.dates.to, this.teamTimezone).utc().unix();
      },
    },
    created() {
      this.setDefaultDates();
      this.$emit('on-created', this.timestampFrom, this.timestampTo);
    },
    methods: {
      onInput() {
        this.$emit('on-input', this.timestampFrom, this.timestampTo);
      },
      setDefaultDates() {
        if (this.defaultFrom && this.defaultTo) {
          this.dates.from = this.setDate(this.defaultFrom);
          this.dates.to = this.setDate(this.defaultTo);
        } else {
          this.dates.from = this.setDate(this.timestampNowSubtract(1, 'hour'));
          this.dates.to = this.setDate(this.timestampNow());
        }
      },
      setDate(timestamp) {
        return moment.unix(timestamp).tz(this.teamTimezone).format('YYYY-MM-DD HH:mm');
      },
      isFutureDate(date) {
        const currentDate = new Date();
        return date > currentDate;
      },
      isPriorToAllowableDate(date) {
        // disable all dates prior to dataRetention setting
        const earliestAllowedDate = moment().subtract(this.teamDataRetention, 'days').startOf('day');
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
    }
  };
</script>
