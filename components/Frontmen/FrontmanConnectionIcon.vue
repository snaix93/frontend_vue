<template>
  <span>
    <v-tooltip
      v-if="state"
      top
      class="v-tooltip--hint"
      max-width="250px"
      :disabled="!stateAttributes.tooltip"
    >
      <template slot="activator">
        <v-avatar
          v-if="state === 'pending'"
          size="22"
          class="qa-frontman"
        >
          <v-icon
            small
            :class="stateAttributes.color + '--text'"
          >cast</v-icon>
        </v-avatar>
        <v-btn
          v-else
          flat
          icon
          :color="stateAttributes.color"
          class="v-btn--mini ma-0 qa-frontman"
        >
          <v-icon small>{{ stateAttributes.icon }}</v-icon>
        </v-btn>
      </template>
      <span v-html="stateAttributes.tooltip"/>
    </v-tooltip>
  </span>
</template>

<script>
  import useDateTime from '@/mixins/useDateTime';

  export default {
    mixins: [useDateTime],
    props: {
      Frontman: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        frontmanConsideredConnectedInSecs: 300,
      };
    },
    computed: {
      frontmanHeartbeat() {
        return this.Frontman.dates.lastHeartbeatAt?.timestamp;
      },
      state() {
        if (!this.Frontman) {
          return null;
        }

        if (!this.frontmanHeartbeat) {
          return 'pending';
        }

        if (this.isConnected) {
          return 'connected';
        }

        return 'disconnected';
      },
      isConnected() {
        return (
          this.getTimeDiffFromNow(this.frontmanHeartbeat, 'seconds')
          <= this.frontmanConsideredConnectedInSecs
        );
      },
      stateAttributes() {
        const attributes = {};
        switch (this.state) {
          case 'connected':
            attributes.icon = 'cast_connected';
            attributes.color = 'success';
            attributes.tooltip = `<strong>${this.$options.filters.capitalize(this.$t('frontman.connected'))}</strong>`;
            break;
          case 'disconnected':
            attributes.icon = 'cast';
            attributes.color = 'highlight';
            attributes.tooltip = `<strong>${this.$options.filters.capitalize(this.$t('frontman.disconnected'))}</strong>`;
            break;
          case 'pending':
            attributes.icon = 'cast';
            attributes.color = 'warning';
            attributes.tooltip = `<strong>${this.$options.filters.capitalize(this.$t('frontman.pending'))}</strong>`;
            break;
          default:
            attributes.icon = 'cast';
            attributes.color = 'grey';
        }

        if(!!attributes.tooltip && !!this.Frontman.version) {
          attributes.tooltip += `<br>${this.$options.filters.capitalize(this.$t('phrase.version'))}: `
          attributes.tooltip += `${this.Frontman.version}`
        }

        return attributes;
      },
    },
  };
</script>
