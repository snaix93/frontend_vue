<template>
  <v-tooltip bottom>
    <span v-if="['error', 'alert'].includes(eventType)">
      {{ $t('phrase.alert') | capitalize }}
    </span>
    <span v-else-if="eventType === 'warning'">
      {{ $t('phrase.warning') | capitalize }}
    </span>
    <span v-else>
      {{ Event.meta ? Event.meta.severity : '-' }}
    </span>
    <td
      :class="{
        'd-flex': true,
        'events-table--severity': true,
        'error': ['error', 'alert'].includes(eventType),
        'lighten-1': ['error', 'alert'].includes(eventType),
        'warning': eventType === 'warning',
        'grey': eventType === 'default',
        'white--text': true,
        'animated infinite flash slow': newEvent,
      }"
      slot="activator"
    >
      <template v-if="['error', 'alert'].includes(eventType)">
        <v-icon color="white">
          error
        </v-icon>
      </template>
      <template v-else-if="eventType === 'warning'">
        <v-icon color="white">
          warning
        </v-icon>
      </template>
      <template v-else>
        <v-icon color="white">
          info
        </v-icon>
      </template>
    </td>
  </v-tooltip>
</template>

<script>
  import useDateTime from '@/mixins/useDateTime';
  import Event from '@/models/Event';

  export default {
    props: {
      Event: {
        type: Event,
        required: true,
      },
    },
    mixins: [useDateTime],
    computed: {
      newEvent() {
        return this.getTimeDiffFromNow(this.Event.dates.createdAt.timestamp) < 30000;
      },
      eventType() {
        if (this.Event.action === 'error' || this.Event.meta?.severity === 'error') {
          return 'error';
        }

        if (this.Event.action === 'alert' || this.Event.meta?.severity === 'alert') {
          return 'alert';
        }

        if (this.Event.action === 'warn' || this.Event.meta?.severity === 'warning') {
          return 'warning';
        }

        return 'default';
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .events-table--severity
    box-shadow: inset -2px 0 0 0 rgba(0, 0, 0, 0.3)
</style>
