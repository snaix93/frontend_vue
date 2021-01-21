<template>
  <div>
    <v-tooltip
      v-if="state !== 'none'"
      :disabled="!stateAttributes.tooltip"
      :class="{ 'v-tooltip--hint' : state === 'pending' }"
      max-width="250px"
      top
    >
      <template slot="activator">
        <v-avatar
          v-if="state === 'pending'"
          class="qa-cagent"
          size="22"
        >
          <v-icon
            :class="stateAttributes.color + '--text'"
            small
          >
            cast
          </v-icon>
        </v-avatar>
        <v-btn
          v-else
          :color="stateAttributes.color"
          :title="$t('host.inventory.title') | capitalize"
          class="v-btn--mini ma-0 qa-cagent"
          flat
          icon
          @click="onClick"
        >
          <v-icon small>
            {{ stateAttributes.icon }}
          </v-icon>
        </v-btn>
        <v-chip
          v-if="detailed"
          :color="stateAttributes.color"
          class="v-chip--mini ma-0 caption qa-status"
          text-color="white"
        >
          {{ state }}
        </v-chip>
      </template>
      <span>{{ stateAttributes.tooltip }}</span>
    </v-tooltip>
  </div>
</template>

<script>
  import useDateTime from '@/mixins/useDateTime';
  import hostMixins from '@/mixins/host';

  export default {
    mixins: [useDateTime, hostMixins],
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
      checkForUpdate: {
        type: Boolean,
        required: false,
        default: false,
      },
      useLastUpdateTime: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    data() {
      return {
        state: 'none',
        checkForUpdateInterval: null,
        agentConsideredConnectedInSecs: 330,
      };
    },
    computed: {
      stateAttributes() {
        const attributes = {};
        switch (this.state) {
          case 'connected':
            attributes.icon = 'cast_connected';
            attributes.color = 'success';
            attributes.tooltip = ! this.detailed ? this.$options.filters.capitalize(
              this.$t('host.cagent.connected'),
            ) : '';
            break;
          case 'disconnected':
            attributes.icon = 'cast';
            attributes.color = 'highlight';
            attributes.tooltip = ! this.detailed ? this.$options.filters.capitalize(
              this.$t('host.cagent.disconnected'),
            ) : '';
            break;
          case 'pending':
            attributes.icon = 'cast';
            attributes.color = 'warning';
            attributes.tooltip = this.$options.filters.capitalize(this.$t('host.cagent.pending'));
            break;
          default:
            attributes.icon = 'cast';
            attributes.color = 'grey';
        }

        return attributes;
      },
    },
    mounted() {
      this.state = this.getState();

      if (this.checkForUpdate) {
        this.checkForUpdateInterval = setInterval(() => {
          this.state = this.getState();
        }, 5000);
      }
    },
    beforeDestroy() {
      if (this.checkForUpdateInterval) clearInterval(this.checkForUpdateInterval);
    },
    methods: {
      onClick() {
        this.$emit('click');
      },
      isAgentAlive() {
        let t;
        if (!!this.useLastUpdateTime) {
          t = this.getTimeDiffFromLastUpdate(this.Host.lastAgentCheckedAtDate.timestamp, 'seconds');
        } else {
          t = this.getTimeDiffFromNow(this.Host.lastAgentCheckedAtDate.timestamp, 'seconds');
        }

        // TODO - v2:v3 merge check
        // Is this needed from v2????
        // let t;
        // if (!! this.useLastUpdateTime) {
        //   t = this.getTimeDiffBetweenTwoUtcMoments(this.lastUpdateTimeFromServer.timestamp,
        //     this.Host.dates.cagentLastUpdatedAt.timestamp,
        //     'seconds');
        // } else {
        //   t = this.getTimeDiffFromNow(this.Host.dates.cagentLastUpdatedAt.timestamp, 'seconds');
        // }
        //
        return (t <= this.agentConsideredConnectedInSecs);
      },
      getState() {
        if (! this.Host.hasMonitoringAgent) {
          return 'none';
        }

        if (! this.Host.hasLastAgentCheckedAtDate) {
          return 'pending';
        }

        if (this.isAgentAlive()) {
          return 'connected';
        }

        return 'disconnected';
      },
    },
  };
</script>
