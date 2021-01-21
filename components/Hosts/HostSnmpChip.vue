<template>
  <v-chip
    class="v-chip--mini my-0 caption qa-snmp-status"
    :color="stateAttributes.color"
    text-color="white"
  >
    {{ state }}
  </v-chip>
</template>

<script>
  import useDateTime from '@/mixins/useDateTime';
  import hostMixins from '@/mixins/host';

  export default {
    mixins: [useDateTime, hostMixins],
    props: {
      host: {
        type: Object,
        required: true,
      },
      checkForUpdate: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    data() {
      return {
        state: 'none',
        checkForUpdateInterval: null,
        snmpConsideredConnectedInSecs: 300,
      };
    },
    computed: {
      stateAttributes() {
        const attributes = {};
        switch (this.state) {
          case 'connected':
            attributes.color = 'success';
            break;
          case 'disconnected':
            attributes.color = 'highlight';
            break;
          case 'pending':
            attributes.color = 'warning';
            break;
          default:
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
      isSnmpAlive() {
        return (
          this.getTimeDiffFromNow(this.host.dates.snmpLastUpdatedAt.timestamp, 'seconds')
          <= this.snmpConsideredConnectedInSecs
        );
      },
      getState() {
        if (!this.host.snmp.protocol) {
          return 'none';
        }
        if (this.host.snmp.protocol && !this.host.dates.snmpLastUpdatedAt) {
          return 'pending';
        }
        if (this.host.snmp.protocol && this.isSnmpAlive()) {
          return 'connected';
        }
        return 'disconnected';
      },
    },
  };
</script>
