<template>
  <v-dialog
    :value="dialog"
    scrollable
    persistent
    lazy
    max-width="600px"
  >
    <v-card class="frontman-host-info-dialog--card">
      <v-card-title class="py-2 grey lighten-3">
        <span class="headline">
          {{ Frontman.location }}
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
            {{ $t('frontman.hostInfo.title') }}
          </v-subheader>
          <v-alert
            v-if="Frontman.hostInfo.length === 0 || !!Frontman.hostInfo.checkType"
            type="error"
            outline
            :value="true"
            class="mt-0 mx-3"
          >
            {{ $t('frontman.hostInfo.noData') }}
          </v-alert>
          <template v-else>
            <v-list-tile
              v-for="(item, i) in frontmanHostInfoList"
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
      inventoryMixins,
      chartMixins,
      useDateTime,
    ],
    computed: {
      ...mapState('frontmen', {
        Frontman: 'Frontman',
        dialog: 'hostInfoDialog',
      }),
      frontmanHostInfoList() {
        return [
          {
            name: 'os',
            display: this.inventory_OS(
              this.Frontman.hostInfo.osKernel,
              this.Frontman.hostInfo.osFamily,
              this.Frontman.hostInfo.osArch,
            ),
            label: this.$t('frontman.hostInfo.os'),
            icon: this.inventory_OSIcon(this.Frontman.hostInfo.osKernel),
            tooltip: this.Frontman.hostInfo.uname,
          },
          {
            name: 'memory',
            display: this.chart_formatBytes(this.Frontman.hostInfo.memoryTotalB),
            label: this.$options.filters.capitalize(
              this.$t('frontman.hostInfo.memory'),
            ),
            icon: 'fas fa-memory fa-lg',
          },
          {
            name: 'cpu_model',
            display: this.Frontman.hostInfo.cpuModel,
            label: this.$t('frontman.hostInfo.cpu'),
            icon: 'fas fa-microchip fa-lg',
          },
          {
            name: 'fqdn',
            display: this.Frontman.hostInfo.fqdn,
            label: this.$t('frontman.hostInfo.fqdn'),
            icon: 'fas fa-desktop fa-lg',
          },
        ];
      },
    },
    methods: {
      ...mapMutations('frontmen', ['toggleHostInfoDialog']),
      onCancel() {
        this.toggleHostInfoDialog();
      },
    },
  };
</script>
<style lang="stylus" scoped>
  .frontman-host-info-dialog--card
    max-width: 100%
</style>
