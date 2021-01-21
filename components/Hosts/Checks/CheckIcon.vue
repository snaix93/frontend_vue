<template>
  <v-tooltip
    :color="stateColor"
    bottom
  >
    <v-icon
      slot="activator"
      :color="stateColor"
      class="check-icon-icon"
    >
      {{ stateIcon }}
    </v-icon>

    <p class="mb-1">
      <strong>{{ $t('checks.lastCheck') }}:</strong> {{ timeStamp }}
    </p>
    <p class="mb-0">
      <strong>{{ $t('checks.status') }}:</strong> {{ statusString }}
    </p>

    <template v-if="state !== PENDING">
      <p
        v-if="!!check.lastMessage"
        class="mt-1 mb-0"
      >
        <strong>{{ $t('checks.message') }}:</strong> {{ check.lastMessage }}
      </p>
      <p
        v-else-if="!!check.expectedUpdateInterval && [NO_DATA, ERROR].includes(state)"
        class="mt-1 mb-0"
      >
        <strong>{{ $t('checks.message') }}:</strong> {{ $t('checks.updateIntervalExceeded') }}
      </p>
    </template>
  </v-tooltip>
</template>

<script>
  import useDateTime from '@/mixins/useDateTime';

  const NOT_CHECKED = 'notChecked'
  const ERROR = 'error';
  const SUCCESS = 'success';
  const PENDING = 'pending';
  const NO_DATA = 'noData';

  export default {
    mixins: [useDateTime],
    props: {
      check: {
        type: Object,
        required: true,
      },
    },
    data() {
      return { NOT_CHECKED, ERROR, SUCCESS, PENDING, NO_DATA };
    },
    computed: {
      state() {
        // This first checked should never actually happen, but just in case...
        if (this.check.lastSuccess === null) return NOT_CHECKED;

        // Custom checks will return NO_DATA if we haven't heard from them within
        // the specified update interval.
        if (this.check.lastSuccess === 4) return NO_DATA;

        // If in a pending state (due to being a new check or because it was just updated),
        // then show pending icon. This will update automatically when check runs on hub.
        if (this.check.lastSuccess === 3) return PENDING;

        // Checks are up to date, so show the state from backend based on last check result.
        if (this.check.lastSuccess === 0) return ERROR;
        if (this.check.lastSuccess === 1 && ! this.stateSuccessOutOfDate) {
          return SUCCESS;
        }

        return ERROR;
      },
      stateSuccessOutOfDate() {
        const now = this.timestampNow();
        const outOfDateInterval = this.check.checkInterval + 300;
        const lastCheckedAtTimestamp = this.check.dates.lastCheckedAt?.local.timestamp;
        const outOfDateTimestamp = now - outOfDateInterval;

        if (lastCheckedAtTimestamp < outOfDateTimestamp) return true;

        return false;
      },
      stateColor() {
        const colors = {
          [NOT_CHECKED]: 'warning',
          [SUCCESS]: 'success',
          [PENDING]: 'warning',
          [ERROR]: 'error',
          [NO_DATA]: 'grey',
        };

        return colors[this.state];
      },
      stateIcon() {
        const icons = {
          [NOT_CHECKED]: 'help',
          [SUCCESS]: 'thumb_up',
          [PENDING]: 'loop',
          [ERROR]: 'error',
          [NO_DATA]: 'help',
        };

        return icons[this.state];
      },
      statusString() {
        const strings = {
          [NOT_CHECKED]: this.$t('checks.statuses.pending'),
          [SUCCESS]: this.$t('checks.statuses.success'),
          [PENDING]: this.$t('checks.statuses.pending'),
          [ERROR]: this.$t('checks.statuses.error'),
          [NO_DATA]: this.$t('checks.statuses.noData'),
        };

        return strings[this.state];
      },
      timeStamp() {
        if (! this.check || ! this.$auth.team.timezone || ! this.check.dates.lastCheckedAt) {
          return null;
        }

        return this.check.dates.lastCheckedAt.local.readable;
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .check-icon-icon
    cursor: pointer
</style>
