<template>
  <v-dialog
    :value="dialog"
    scrollable
    persistent
    lazy
    max-width="600px"
  >
    <v-card class="host-inventory-dialog--card">
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ Host.name }}
        </span>
        <v-spacer/>
        <v-btn
          icon
          @click="onCancel"
        >
          <v-icon>clear</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider/>

      <v-card-text>
        <v-list class="pa-0">
          <v-subheader class="text-uppercase">
            {{ $t('host.inventory.title') }}
          </v-subheader>
          <v-alert
            type="error"
            outline
            :value="Host.inventory.length === 0"
            class="mt-0 mx-3"
          >
            {{ $t('host.inventory.noData') }}
          </v-alert>
          <template v-if="Host.inventory && Host.inventory.length !== 0">
            <v-list-tile
              v-for="(item, i) in hostInventoryList"
              :key="i"
              avatar
            >
              <v-list-tile-avatar
                v-if="item.icon === 'OS'"
                color="grey darken-1"
                size="32"
                class="pl-1"
              >
                <span class="white--text subheading">{{ item.icon }}</span>
              </v-list-tile-avatar>
              <v-list-tile-avatar v-else>
                <i
                  :class="item.icon"
                  class="grey--text text--darken-1"
                />
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>
                  <v-tooltip
                    v-if="item.tooltip"
                    bottom
                    class="v-tooltip--hint text-truncate"
                    max-width="300px"
                  >
                    <div
                      slot="activator"
                      class="text-truncate"
                    >
                      {{ item.display }}
                    </div>
                    <span>{{ item.tooltip }}</span>
                  </v-tooltip>
                  <template
                    v-else
                    class="text-truncate"
                  >
                    <template v-if="item.display">
                      {{ item.display }}
                    </template>
                    <template v-else>
                      {{ $t('phrase.notAvailable') }}
                    </template>
                  </template>
                </v-list-tile-title>
                <v-list-tile-sub-title>
                  {{ item.label }}
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </v-card-text>

      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn
          color="primary"
          flat
          @click="onCancel"
        >
          {{ $t('button.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import inventoryMixins from '@/mixins/inventory';
  import useDateTime from '@/mixins/useDateTime';
  import chartMixins from '@/mixins/chart';

  export default {
    mixins: [
      chartMixins,
      useDateTime,
      inventoryMixins,
    ],
    computed: {
      ...mapState('hosts', {
        dialog: 'inventoryDialog',
      }),
      ...mapState('hosts', ['Host']),
      hostInventoryIPs() {
        const ipItems = [];
        const objKeys = Object.keys(this.Host.inventory);
        const ipKeys = objKeys.filter(key => !!key.includes('.ipv'));

        ipKeys.forEach(item => ipItems.push(this.Host.inventory[item]));

        return ipItems.join(', ');
      },
      hostInventoryCagent() {
        let cagentString = '';

        if (this.Host.hasLastAgentCheckedAtDate) {
          cagentString
            += `${this.formattedTime(this.Host.lastAgentCheckedAtDate.timestamp)
          } h ${
            this.timeAgoDaily(this.Host.lastAgentCheckedAtDate.timestamp)}`;
        }

        if (this.Host.inventory['cagent.version']) {
          cagentString += ` (${this.Host.inventory['cagent.version']})`;
        }

        return cagentString;
      },
      hostInventoryList() {
        return [
          {
            name: 'os',
            display: this.inventory_OS(
              this.Host.inventory['system.os_kernel'],
              this.Host.inventory['system.os_family'],
              this.Host.inventory['system.os_arch'],
            ),
            label: this.$t('host.inventory.os'),
            icon: this.inventory_OSIcon(this.Host.inventory['system.os_kernel']),
            tooltip: this.Host.inventory['system.uname'],
          },
          {
            name: 'memory',
            display: this.chart_formatBytes(
              this.Host.inventory['system.memory_total_B'],
            ),
            label: this.$options.filters.capitalize(
              this.$t('host.inventory.memory'),
            ),
            icon: 'fas fa-memory fa-lg',
          },
          {
            name: 'cpu_model',
            display: this.Host.inventory['system.cpu_model'],
            label: this.$t('host.inventory.cpu'),
            icon: 'fas fa-microchip fa-lg',
          },
          {
            name: 'ip',
            display: this.hostInventoryIPs,
            label: this.$t('host.inventory.ip'),
            icon: 'fas fa-map-marker-alt fa-lg',
            tooltip: this.hostInventoryIPs,
          },
          {
            name: 'fqdn',
            display: this.Host.inventory['system.fqdn'],
            label: this.$t('host.inventory.fqdn'),
            icon: 'fas fa-desktop fa-lg',
          },
          {
            name: 'cagent',
            display: this.hostInventoryCagent,
            label: this.$t('host.inventory.cagent'),
            icon: 'fas fa-heartbeat fa-lg',
          },
        ];
      },
    },
    methods: {
      ...mapMutations('hosts', ['toggleInventoryDialog']),
      onCancel() {
        this.toggleInventoryDialog();
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .host-inventory-dialog--card
    max-width: 100%
</style>
