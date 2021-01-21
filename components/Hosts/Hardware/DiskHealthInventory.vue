<template>
  <div class="disk-health-inventory">
    <v-layout
      row
      wrap
    >
      <v-flex
        v-for="disk in disks"
        :key="disk.key"
        md12
        lg6
        xl4
      >
        <v-card
          :style="`border: 1px solid ${borderColorByStatus(disk)}`"
          tile
          flat
        >
          <v-card-text class="pb-0">
            <v-layout
              row
              wrap
              class="mx-0"
            >
              <span class="subheading font-weight-medium">
                {{ disk.key }}
              </span>
              <v-spacer />

              <v-chip
                color="grey darken-1"
                small
                outline
                label
              >
                {{ disk.type_of }}
              </v-chip>
            </v-layout>
            <div class="grey--text text--darken-1">
              {{ disk.model_name }} ({{ disk.model_family }})
            </div>
          </v-card-text>
          <v-card-title>
            <v-chip
              :color="colorByStatus(disk)"
              class="white--text ma-0 qa-smart-status"
            >
              <v-avatar>
                <v-icon>
                  {{ iconByStatus(disk) }}
                </v-icon>
              </v-avatar>
              {{ disk.smart_status.toUpperCase() }}
            </v-chip>
          </v-card-title>
          <transition name="fade-transition">
            <v-divider v-show="!!disk.showDetails" />
          </transition>
          <transition name="slide-y-transition">
            <v-card-text
              v-show="detailsAreVisible(disk)"
            >
              <template
                v-for="(field, i) in detailFields"
              >
                <div
                  v-if="disk[field.key] !== undefined"
                  :key="`field-${i}`"
                  :class="(i+1) < detailFields.length ? 'mb-2' : ''"
                >
                  <v-layout
                    row
                    align-center
                  >
                    <v-flex
                      class="grey--text text--darken-1 pr-2"
                      shrink
                    >
                      <v-layout
                        row
                        align-center
                      >
                        <span class="list-icon mr-2">
                          <v-icon
                            color="grey darken-1"
                            small
                          >
                            {{ field.icon }}
                          </v-icon>
                        </span>
                        {{ field.label | capitalize }}:
                      </v-layout>
                    </v-flex>
                    <v-flex
                      class="font-weight-medium"
                      grow
                    >
                      {{ disk[field.key] }}
                    </v-flex>
                  </v-layout>
                </div>
              </template>
            </v-card-text>
          </transition>
          <v-card-actions class="grey lighten-3">
            <v-spacer />
            <v-btn
              color="primary"
              flat
              small
              @click="toggleDetails(disk)"
            >
              <template v-if="!detailsAreVisible(disk)">
                <v-icon
                  small
                  left
                >
                  keyboard_arrow_down
                </v-icon>
                {{ $t('button.showMore') }}
              </template>
              <template v-else>
                <v-icon
                  small
                  left
                >
                  keyboard_arrow_up
                </v-icon>
                {{ $t('button.hide') }}
              </template>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      <template v-if="messages && messages.length">
        <v-flex
          v-for="message in messages"
          :key="message.key"
          md12
        >
          <v-card
            :style="`border: 1px solid ${defaultBorderColor}`"
            tile
            flat
          >
            <v-card-title class="subheading font-weight-medium pb-0">
              {{ $tc('host.smartmon.message', messages.length) | capitalize }}
            </v-card-title>
            <v-card-text>
              <v-card
                color="grey lighten-3"
                tile
                flat
              >
                <v-card-text class="font-monospace body-1">
                  {{ message.value }}
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-flex>
      </template>
    </v-layout>
  </div>
</template>

<script>
  export default {
    props: {
      disks: {
        type: Array,
        required: true,
      },
      messages: {
        type: Array,
        required: false,
      },
    },
    data() {
      return {
        showDetails: [],
        detailFields: [
          {
            key: 'device_type',
            label: this.$t('host.smartmon.deviceType'),
            icon: 'fa-hdd',
          },
          {
            key: 'serial_number',
            label: this.$t('phrase.serialNumber'),
            icon: 'fa-barcode',
          },
          {
            key: 'device_protocol',
            label: this.$t('host.smartmon.deviceProtocol'),
            icon: 'fa-scroll',
          },
          {
            key: 'firmware_version',
            label: this.$t('host.smartmon.firmwareVersion'),
            icon: 'fa-toolbox',
          },
          {
            key: 'power_cycle_count',
            label: this.$t('host.smartmon.powerCycleCount'),
            icon: 'fa-plug',
          },
          {
            key: 'interface_speed_Bps',
            label: this.$t('host.smartmon.interfaceSpeedBps'),
            icon: 'fa-tachometer-alt',
          },
          {
            key: 'power_on_time_hours',
            label: this.$t('host.smartmon.powerOnTimeHours'),
            icon: 'fa-clock',
          },
          {
            key: 'reallocated_sector_count',
            label: this.$t('host.smartmon.reallocatedSectorCount'),
            icon: 'fa-puzzle-piece',
          },
        ],
        defaultBorderColor: 'rgba(0,0,0,0.12)',
      };
    },
    methods: {
      toggleDetails(disk) {
        if (this.detailsAreVisible(disk)) {
          this.showDetails.splice(this.showDetails.indexOf(disk.key), 1);
        } else {
          this.showDetails.push(disk.key);
        }
      },
      detailsAreVisible({ key }) {
        return this.showDetails.indexOf(key) !== -1;
      },
      getStatus({key, smart_status}) {
        let status = 'error';

        switch (smart_status.toLowerCase()) {
          case 'passed':
            status = 'success'
            break;
          case 'not available':
            status = 'no_status'
            break;
        }

        return status;
      },
      iconByStatus(disk) {
        const status = this.getStatus(disk);
        let icon = 'remove_circle';

        switch (status) {
          case 'success':
            icon = 'check_circle'
            break;
          case 'error':
            icon = 'error'
            break;
        }

        return icon;
      },
      colorByStatus(disk) {
        const status = this.getStatus(disk);
        let color = 'grey';

        switch (status) {
          case 'success':
            color = 'success'
            break;
          case 'error':
            color = 'error'
            break;
        }

        return color;
      },
      borderColorByStatus(disk) {
        const status = this.getStatus(disk);
        let borderColor = this.defaultBorderColor;

        switch (status) {
          case 'error':
            borderColor = '#c62828'
            break;
        }

        return borderColor;
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .list-icon
    display: inline-block
    width: 20px
    text-align: center
</style>
