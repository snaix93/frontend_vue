<template>
  <div class="measurements-table">
    <template>
      <v-card>
        <v-card-text>
          <v-layout
            row
            wrap
            justify-end
            align-end
            pb-3
          >
            <v-flex
              xs12
              md5
            >
              <v-text-field
                v-model="search"
                append-icon="search"
                :label="$t('form.field.searchByVMName') | capitalize"
                single-line
                hide-details
              />
            </v-flex>
          </v-layout>
        </v-card-text>
      </v-card>
      <v-divider/>
    </template>

    <v-data-table
      :headers="headers"
      :items="items"
      :search="search"
      :pagination.sync="pagination"
      :rows-per-page-items="rowsPerPage"
      :custom-filter="useFrontendFilter_expressionSearch"
      :hide-actions="items.length < 11"
      item-key="id"
      disable-initial-sort
    >
      <template #items="props">
        <tr>
          <td>
            <v-tooltip
              class="hyper-v-metric--name"
              bottom
              color="white"
            >
              <span
                slot="activator"
                :class="
                  (props.item.enabled_state &&
                    props.item.enabled_state == 'shutdown'
                    ? 'error--text'
                    : '') + ' font-weight-medium'
                "
              >
                {{ props.item.name }}
              </span>

              <div class="pa-1">
                <span
                  class="grey--text text--darken-1 mr-2"
                >{{ $t('phrase.enabledState') | capitalize }}:</span>
                <v-chip
                  :color="stateColor(props.item.enabled_state)"
                  text-color="white"
                  class="health-state--chip ma-0"
                  small
                >
                  {{ props.item.enabled_state.toUpperCase() }}
                </v-chip>
              </div>
            </v-tooltip>
          </td>
          <td>
            <v-chip
              v-if="props.item.heartbeat"
              :color="heartBeatColor(props.item.heartbeat)"
              text-color="white"
              class="heartbeat--chip"
              small
            >
              {{ props.item.heartbeat.toUpperCase() }}
            </v-chip>
          </td>
          <td>
            <v-chip
              v-if="props.item.health_state"
              :color="healthStateColor(props.item.health_state)"
              text-color="white"
              class="health-state--chip"
              small
            >
              {{ props.item.health_state.toUpperCase() }}
            </v-chip>
          </td>
          <td>{{ props.item.processor_load_percent }}%</td>
          <td>
            {{ filesize(props.item.assigned_memory) }}
          </td>
          <td class="pl-2 pr-3 text-xs-right">
            <v-btn
              icon
              class="qa-details ma-1"
              @click="showHyperVMetricDialog(props.item)"
            >
              <v-icon color="grey">
                remove_red_eye
              </v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
      <template #no-data>
        <div class="text-xs-center">
          {{ $t('message.error.noData') }}
        </div>
      </template>
      <template #no-results>
        <div class="text-xs-center">
          {{ $t('message.error.noSearchResults', { term: search }) }}
        </div>
      </template>
      <template #page-text="props">
        {{
          $t('paging.count', {
            pageStart: props.pageStart,
            pageStop: props.pageStop,
            itemsLength: props.itemsLength,
          })
        }}
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import { mapMutations } from 'vuex';
  import useFrontendFilter from '@/mixins/useFrontendFilter';
  import hyperVMetricsMixins from '@/mixins/hyperVMetrics';

  export default {
    components: {},
    mixins: [useFrontendFilter, hyperVMetricsMixins],
    props: {
      items: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        search: '',
        searchColumns: ['name'],
        selectedRule: {},
        headers: [
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.vmName', 1)),
            align: 'left',
            value: 'Name',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.heartbeat')),
            align: 'left',
            value: 'heartbeat',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.healthState')),
            align: 'left',
            value: 'health_state',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(
              this.$t('phrase.processorLoad'),
            ),
            align: 'left',
            value: 'processor_load_percent',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(
              this.$t('phrase.assignedMemory'),
            ),
            align: 'left',
            value: 'assigned_memory_B',
            sortable: true,
          },
          {
            text: null,
            align: 'right',
            value: null,
            sortable: false,
          },
        ],
        pagination: {
          sortBy: 'id',
        },
        rowsPerPage: [25, 50, { text: this.$t('phrase.all'), value: -1 }],
      };
    },
    methods: {
      ...mapMutations('hosts', ['toggleHyperVMetricDialog']),
      showHyperVMetricDialog(hyperVMetric) {
        this.$store.commit('hosts/setSelectedHyperVMetric', hyperVMetric);
        this.toggleHyperVMetricDialog();
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .heartbeat--chip
    min-width: 91px
    justify-content: center

  .health-state--chip
    min-width: 91px
    justify-content: center

  .shutdown
    opacity: 0.7

  .hyper-v-metric--name
    cursor: pointer;
</style>
