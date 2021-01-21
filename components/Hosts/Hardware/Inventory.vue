<template>
  <div class="hardware-inventory">
    <div
      v-for="(agentInventory, i) in hardwareInventory"
      :key="`agentInventory${i}`"
      :class="{
        'hardware-inventory--agent-inventory' : true,
        'mt-4' : i > 0
      }"
    >
      <div
        v-if="hardwareInventory.length > 1"
        class="hardware-inventory--title subheading mb-2"
      >
        {{ $t('phrase.cagent') }}
        <v-chip
          class="caption font-weight-medium"
          color="primary"
          outline
        >
          {{ i+1 }}
        </v-chip>
      </div>

      <v-layout wrap>
        <v-flex
          lg4
          xs12
        >
          <SpecCard
            v-model="agentInventory.showBaseBoard"
            fill-height
          >
            <template #title>
              <v-icon
                color="secondary"
                left
              >
                desktop_windows
              </v-icon>
              {{ $t('phrase.baseBoard') | capitalize }}
              <v-spacer />
            </template>
            <template #content>
              <v-list>
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      {{ $t('host.hardwareInventory.model') | capitalize }}
                    </v-list-tile-sub-title>
                    <v-list-tile-title>
                      <div class="text-truncate">
                        {{ agentInventory['baseboard.manufacturer'] }} {{ agentInventory['baseboard.model'] }}
                      </div>
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      {{ $t('phrase.serialNumber') | capitalize }}
                    </v-list-tile-sub-title>
                    <v-list-tile-title>
                      <div class="text-truncate">
                        {{ agentInventory['baseboard.serial_number'] }}
                      </div>
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </template>
          </SpecCard>
        </v-flex>

        <v-flex
          lg4
          xs12
          v-for="(cpu, j) in agentInventory.cpus"
          :key="`agent-${i}-cpu-${j}`"
        >
          <SpecCard
            v-model="agentInventory[`showCPU${j}`]"
            fill-height
          >
            <template #title>
              <v-icon
                color="secondary"
                left
              >
                fa-microchip
              </v-icon>
              {{ $t('phrase.cpu') | capitalize }}
              <template v-if="agentInventory.cpus.length > 1">
                ({{ j+1 }})
              </template>
              <v-spacer />
            </template>
            <template #content>
              <v-list>
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      {{ $t('host.hardwareInventory.manufacturer') | capitalize }}
                    </v-list-tile-sub-title>
                    <v-list-tile-title>
                      <div class="text-truncate">
                        {{ cpu['manufacturer'] }}
                      </div>
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile v-if="!!cpu['manufacturer_info']">
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      {{ $t('host.hardwareInventory.manufacturerInfo') | capitalize }}
                    </v-list-tile-sub-title>
                    <v-list-tile-title>
                      <div class="text-truncate">
                        {{ cpu['manufacturer_info'] }}
                      </div>
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile v-if="!!cpu['description']">
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      {{ $t('phrase.description') | capitalize }}
                    </v-list-tile-sub-title>
                    <v-list-tile-title>
                      <div class="text-truncate">
                        {{ cpu['description'] }}
                      </div>
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile v-if="!!cpu['core_count']">
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      {{ $t('host.hardwareInventory.cores') | capitalize }}
                    </v-list-tile-sub-title>
                    <v-list-tile-title>
                      <div class="text-truncate qa-hd-cores">
                        {{ cpu['core_count'] }}

                        <span
                          v-if="!!cpu['core_enabled']"
                          class="grey--text text--darken-1 qa-hd-cores-enabled"
                        >
                          ({{ $t('host.hardwareInventory.coresEnabled', {
                            count: cpu['core_count']
                          }) | capitalize }})
                        </span>
                      </div>
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile v-if="!!cpu['thread_count']">
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      {{ $t('host.hardwareInventory.threads') | capitalize }}
                    </v-list-tile-sub-title>
                    <v-list-tile-title>
                      <div class="text-truncate qa-hd-threads">
                        {{ cpu['thread_count'] }}
                      </div>
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </template>
          </SpecCard>
        </v-flex>

        <v-flex
          lg4
          xs12
        >
          <SpecCard
            v-model="agentInventory.showRAM"
            fill-height
          >
            <template #title>
              <v-icon
                color="secondary"
                left
              >
                fa-memory
              </v-icon>
              {{ $t('phrase.memory') | capitalize }}
              <v-spacer />
            </template>
            <template #content>
              <v-list>
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      {{ $t('host.hardwareInventory.numberOfModules') | capitalize }}
                    </v-list-tile-sub-title>
                    <v-list-tile-title>
                      <div class="text-truncate">
                        {{ agentInventory['ram.number_of_modules'] }}
                      </div>
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile v-if="!!agentInventory['ram.0.size_B']">
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      {{ $t('phrase.size') | capitalize }}
                    </v-list-tile-sub-title>
                    <v-list-tile-title>
                      <div class="text-truncate">
                        {{ filesize(agentInventory['ram.0.size_B']) }}
                      </div>
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile v-if="!!agentInventory['ram.0.type']">
                  <v-list-tile-content>
                    <v-list-tile-sub-title>
                      {{ $t('phrase.type') | capitalize }}
                    </v-list-tile-sub-title>
                    <v-list-tile-title>
                      <div class="text-truncate">
                        {{ agentInventory['ram.0.type'] }}
                      </div>
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </template>
          </SpecCard>
        </v-flex>

        <v-flex
          v-for="(list, j) in inventoryLists(agentInventory)"
          :key="`deviceList${j}`"
          lg6
          xs12
        >
          <SpecCard
            v-model="agentInventory[`show${list.key}`]"
            fill-height
          >
            <template #title>
              <v-icon
                color="secondary"
                left
              >
                settings_input_hdmi
              </v-icon>
              {{ titleFromKey(list.key) | capitalize }}
            </template>
            <template #content>
              <div class="hardware-inventory--device-list py-0">
                <div
                  v-for="(item, k) in list.items"
                  :key="`deviceListItem${k}`"
                  :class="{
                    'hardware-inventory--device-list--item' : true,
                    'white' : k % 2 === 0,
                    'grey lighten-4' : k % 2 === 1,
                    'px-3 py-2' : true
                  }"
                >
                  <div
                    v-for="attribute in item"
                    :key="attribute.key"
                  >
                    <div class="body-1 text-truncate">
                      <span class="grey--text text--darken-1">
                        {{ attribute.key | capitalize }}:
                      </span>
                      <span class="font-weight-medium">
                        {{ attribute.value }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </SpecCard>
        </v-flex>
      </v-layout>
    </div>
  </div>
</template>

<script>
  import SpecCard from '@/components/Hosts/Hardware/SpecCard';

  import hyperVMetricsMixins from '@/mixins/hyperVMetrics';
  import inventoryMixins from '@/mixins/inventory';

  export default {
    components: {
      SpecCard,
    },
    mixins: [
      hyperVMetricsMixins,
      inventoryMixins,
    ],
    props: {
      value: {
        type: Array,
        required: true,
      },
    },
    data() {
      const hardwareInventory = JSON.parse(JSON.stringify(this.value));

      hardwareInventory.map((agentInventory) => {
        agentInventory.showBaseBoard = true;
        agentInventory.showRAM = true;
        agentInventory.cpus = this.inventory_cpuData(agentInventory).cpus;

        agentInventory.cpus.forEach((cpu, i) => {
          agentInventory[`showCPU${i}`] = true;
        });

        Object.keys(agentInventory).forEach((key) => {
          if (Array.isArray(agentInventory[key])) {
            agentInventory[`show${key}`] = false;
          }
        });

        return agentInventory;
      });

      return {
        hardwareInventory,
      };
    },
    methods: {
      inventoryLists(agentInventory) {
        const result = [];

        Object.keys(agentInventory).forEach((key) => {
          if (
            key !== 'cpus'
            && Array.isArray(agentInventory[key])
          ) {
            const items = agentInventory[key].map((item) => {
              const attributes = [];

              Object.keys(item).forEach((itemKey) => {
                attributes.push({
                  key: itemKey.replace('_', ' '),
                  value: item[itemKey],
                });
              });

              return attributes;
            });

            result.push({
              key,
              items,
            });
          }
        });


        return result;
      },
      titleFromKey(key) {
        const splitKey = key.split('.');
        if (splitKey.length > 1 && splitKey[1] === 'list') {
          return this.$t('host.hardwareInventory.deviceList', {
            name: splitKey[0],
          });
        }

        return key;
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .hardware-inventory--device-list
    max-height: 540px
    overflow: auto
</style>
