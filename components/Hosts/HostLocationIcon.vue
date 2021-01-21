<template>
  <div :class="{ 'text-truncate': detailed && type === 'public' }">
    <v-tooltip
      v-if="type !== 'local'"
      class="v-tooltip--hint"
      max-width="260"
      top
    >
      <template slot="activator">
        <v-icon
          :class="'qa-frontman-' + type"
          :color="typeAttributes.color"
          small
        >
          {{ typeAttributes.icon }}
        </v-icon>
        <v-chip
          v-if="detailed && type === 'private'"
          :color="stateAttributes.color"
          class="v-chip--mini caption ma-0 qa-status"
          text-color="white"
        >
          {{ state }}
        </v-chip>
        <span
          v-if="detailed && type === 'public'"
        >{{ typeAttributes.location }}</span>
      </template>
      <span>{{ typeAttributes.tooltip }}</span>
    </v-tooltip>
  </div>
</template>

<script>
  import hostLocationMixins from '@/mixins/hostLocation';

  export default {
    mixins: [hostLocationMixins],
    props: {
      Host: {
        type: Object,
        required: true,
      },
      detailed: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    computed: {
      type() {
        if (this.Host.hasMonitoringAgent && ! this.Host.connect) {
          return 'local';
        }
        return this.Host.frontman.type;
      },
      state() {
        if (this.type === 'public') {
          return 'none';
        }
        if (! this.Host.frontman.lastHeartbeatAt) {
          return 'pending';
        }
        if (this.hostLocation_isFrontmanConnected(this.Host.frontman)) {
          return 'connected';
        }
        return 'disconnected';
      },
      stateAttributes() {
        const attributes = {};
        switch (this.state) {
          case 'connected':
            attributes.color = 'success';
            attributes.label = this.$t('frontman.connected');
            attributes.tooltip = ! this.detailed ? `: ${attributes.label}` : '';
            break;
          case 'pending':
            attributes.color = 'warning';
            attributes.label = 'pending';
            attributes.tooltip = `: ${this.$t('frontman.pending')}`;
            break;
          case 'disconnected':
            attributes.color = 'highlight';
            attributes.label = this.$t('frontman.disconnected');
            attributes.tooltip = ! this.detailed ? `: ${attributes.label}` : '';
            break;
          default:
            attributes.color = 'secondary';
            attributes.label = '';
            attributes.tooltip = '';
        }
        return attributes;
      },
      typeAttributes() {
        const attributes = {};

        attributes.location = this.Host.frontman.location;

        switch (this.type) {
          case 'public':
            attributes.icon = 'public';
            attributes.color = 'secondary';
            attributes.tooltip = this.$t('frontman.publicDescription',
              { location: this.Host.frontman.location });
            break;
          case 'private':
            attributes.icon = 'vpn_lock';
            attributes.color = this.stateAttributes.color;
            attributes.tooltip = this.$t('frontman.privateDescription',
              { location: this.Host.frontman.location })
                                 + this.stateAttributes.tooltip;
            break;
        }

        return attributes;
      },
    },
  };
</script>
