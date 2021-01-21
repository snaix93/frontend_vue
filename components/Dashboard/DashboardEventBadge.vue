<template>
  <div class="d-inline event-badge">
    <v-btn
      v-if="hasEvents"
      :class="buttonClass"
      :color="hasEventsColor"
      :title="title"
      depressed
      round
      @click="handleClick()"
    >
      <v-avatar :class="avatarClass">
        {{ eventCount }}
      </v-avatar>
      {{ $tc(labelLangKey, eventCount) | capitalize }}
    </v-btn>

    <v-btn
      v-else
      :class="buttonClass"
      :color="noEventsColor"
      :ripple="false"
      :title="title"
      class="no-click-event"
      depressed
      round
    >
      <v-avatar :class="avatarClass">
        0
      </v-avatar>
      {{ $tc(labelLangKey, 0) | capitalize }}
    </v-btn>
  </div>
</template>

<script>
  export default {
    props: {
      events: {
        required: false,
        type: Array,
        default: () => [],
      },
      eventsCount: {
        required: false,
        type: Number,
        default: 0,
      },
      size: {
        required: false,
        type: String,
        default: 'large'
      },
      hasEventsColor: {
        required: false,
        type: String,
      },
      noEventsColor: {
        required: false,
        type: String,
      },
      title: {
        required: false,
        type: String,
        default: '',
      },
      labelLangKey: {
        required: true,
        type: String,
      },
      qaClassName: {
        required: false,
        type: String,
        default: '',
      },
    },
    computed: {
      eventCount() {
        if (this.events.length) {
          return this.events.length;
        }
        return this.eventsCount;
      },
      hasEvents() {
        return this.events.length || this.eventsCount;
      },
      buttonClass() {
        return [
          this.qaClassName,
          {
            'event-badge-button-small v-chip--small': this.size === 'small',
            'event-badge-button-large': this.size === 'large',
          },
          'event-badge-button white--text titlecase v-chip v-chip--disabled ml-0',
        ];
      },
      avatarClass() {
        return [
          this.hasEvents ? this.hasEventsColor : this.noEventsColor,
          'darken-1',
        ];
      },
      hasClickListener() {
        return this.$listeners && !! this.$listeners['eb-click'];
      },
    },
    methods: {
      handleClick() {
        this.$emit('eb-click');
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .event-badge >>> .event-badge-button .v-btn__content
    justify-content: start !important

  .v-chip.event-badge-button
    padding: 0 12px 0 10px
    margin: 0 3px !important
    display: inline-flex !important
    min-width: 0 !important

    &.event-badge-button-small
      font-size 12px
      font-weight: normal !important

      .v-avatar
        font-size 14px

    &.event-badge-button-large
      font-size 13px
      font-weight: 500 !important
      height: 32px !important

      .v-avatar
        font-size 20px

    &.no-click-event
      cursor: default;

      &:hover:before
        background-color: inherit !important
</style>
