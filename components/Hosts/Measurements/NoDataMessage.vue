<template>
  <div
    class="caption mx-2 pa-3 grey lighten-2"
  >
    <v-layout
      row
      wrap
      align-center
    >
      <v-flex
        shrink
        mr-2
      >
        <v-icon color="grey darken-1">
          error
        </v-icon>
      </v-flex>
      <v-flex
        xs12
        md8
      >
        <template v-if="showCagentUpgadeMessage">
          <span
            v-html="$t('charts.pleaseUpgradeYourAgent', {
              url: 'https://docs.cloudradar.io/configuring-hosts/installing-agents/upgrading-the-agent'
            })"
          />
        </template>
        <template v-else>
          {{ $t('charts.noData') | capitalize }}
        </template>
      </v-flex>
    </v-layout>
  </div>
</template>
<script>
  import { mapState } from 'vuex'

  export default {
    props: {
      endpoint: {
        type: String,
        required: false,
      }
    },
    data() {
      return {};
    },
    computed: {
      ...mapState('hostCharts', ['bandwidthChartAvailable']),
      showCagentUpgadeMessage() {
        return this.endpoint
               && this.endpoint === 'net.total_in_B_per_s,net.total_out_B_per_s'
               && !this.bandwidthChartAvailable
      }
    }
  };
</script>
