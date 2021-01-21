<template>
  <v-tooltip
    :disabled="!Event.meta || !Event.meta.check"
    bottom
  >
    <span v-if="Event.checkKey.length >= checkKeyTruncateLength">
      {{ Event.checkKey }}
    </span>
    <span
      v-else-if="Event.meta && Event.meta.check"
    >
      <template v-if="Event.action === 'warn'">
        {{
          $t('dashboard.theRuleHasTriggeredAWarning', { text: Event.meta.name })
            | capitalize
        }}
      </template>
      <template v-else>
        {{
          $t('dashboard.theRuleHasTriggeredAnAlert', { text: Event.meta.name })
            | capitalize
        }}
      </template>
    </span>
    <div
      slot="activator"
      :class="{'d-inline-block': true, 'events-table--issue': true}"
    >
      <AppChip
        small
        color="grey darken-1"
        class="justify-center events-table--check-key mr-0"
      >
        {{ Event.checkKey | truncate(checkKeyTruncateLength) }}
      </AppChip>

      <AppChip
        small
        color="grey"
        class="justify-center events-table--message"
      >
        {{ Event.message }}
      </AppChip>
    </div>
  </v-tooltip>
</template>

<script>
  import AppChip from '@/components/App/AppChip';
  import Event from '@/models/Event';

  export default {
    components: {
      AppChip,
    },
    props: {
      Event: {
        type: Event,
        required: true,
      },
    },
    data() {
      return {
        checkKeyTruncateLength: 28,
      };
    },
  };
</script>

<style lang="stylus" scoped>
  .events-table--issue
    white-space: nowrap

    .events-table--check-key
      border-top-right-radius: 0
      border-bottom-right-radius: 0

    .events-table--message
      margin-left: -5px
      border-top-left-radius: 0
      border-bottom-left-radius: 0
</style>
