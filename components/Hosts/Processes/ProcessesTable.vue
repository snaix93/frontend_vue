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
              md7
            >
              <v-checkbox
                v-model="showKernelTasks"
                :label="showKernelTasksLabel | capitalize"
                hide-details
              />
            </v-flex>
            <v-flex
              xs12
              md5
            >
              <v-text-field
                v-model="search"
                append-icon="search"
                :label="$t('form.field.searchFor', {
                  field: $t('form.field.processName')
                }) | capitalize"
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
      :items="filteredItems"
      :search="search"
      :pagination.sync="pagination"
      :rows-per-page-items="rowsPerPage"
      :custom-filter="useFrontendFilter_expressionSearch"
      :hide-actions="items.length < 11"
      item-key="pid"
      disable-initial-sort
    >
      <template #headerCell="{ header }">
        {{ header.text }}
        <template v-if="header.value === 'state'">
          <HelpTooltip
            :tooltip="$tooltip('PROCESSES_STATE')"
            class="mx-1 table--help-tooltip"
            orientation="bottom"
          />
        </template>
      </template>

      <template #items="props">
        <tr>
          <td>
            {{ props.item.pid }}
          </td>
          <td>
            <span class="font-weight-medium">
              {{ props.item.name }}
            </span>
          </td>
          <td>
            {{ props.item.parent_pid !== null ? props.item.parent_pid : '' }}
          </td>
          <td>
            <v-chip
              v-if="props.item.state"
              :color="stateColor(props.item.state)"
              text-color="white"
              small
            >
              {{ $t(`host.processStates.${props.item.state}`).toUpperCase() }}
            </v-chip>
          </td>
          <td>
            <v-tooltip
              v-if="props.item.memory_usage_percent !== undefined"
              left
              :disabled="!props.item.rss || !props.item.vms"
            >
              <span
                slot="activator"
                :class="{ 'pointer' : (props.item.rss || props.item.vms) }"
              >
                {{ props.item.memory_usage_percent }}%
              </span>
              <div
                v-if="props.item.rss"
                class="resident-set-size"
              >
                {{ $t('host.residentSetSize') | capitalize }} (MB):
                <span class="font-weight-medium">
                  {{ filesize(props.item.rss) }}
                </span>
              </div>
              <div
                v-if="props.item.vms"
                class="resident-set-size"
              >
                {{ $t('host.virtualMemorySize') | capitalize }} (MB):
                <span class="font-weight-medium">
                  {{ filesize(props.item.vms) }}
                </span>
              </div>
            </v-tooltip>
          </td>
          <td>
            <pre
              v-if="exceedsTruncateLength(props.item.cmdline)"
              class="pointer codeDisplay"
            ><u><span @click="props.expanded = !props.expanded">{{ props.item.cmdline | truncate(truncateLength) }}</span></u></pre>

            <pre
              v-else
              class="codeDisplay"
            >{{ props.item.cmdline }}</pre>
          </td>
          <td class="pl-2 pr-2 text-no-wrap text-xs-right">
            <v-tooltip left>
              <v-btn
                slot="activator"
                icon
                class="mx-0"
                @click="createRuleForProcess(props.item)"
              >
                <v-icon
                  small
                  color="secondary"
                >
                  fas fa-magic
                </v-icon>
              </v-btn>
              {{ $t('button.addARule') | capitalize }}
            </v-tooltip>

            <v-btn
              icon
              class="mx-0"
              :disabled="!exceedsTruncateLength(props.item.cmdline)"
              @click="props.expanded = !props.expanded"
            >
              <v-icon>
                <template v-if="!props.expanded">
                  expand_more
                </template>
                <template v-else>
                  expand_less
                </template>
              </v-icon>
            </v-btn>
          </td>
        </tr>
      </template>

      <template #expand="{ item }">
        <v-card
          v-if="exceedsTruncateLength(item.cmdline)"
          flat
        >
          <v-card-text>
            <pre class="codeDisplay">
                 <kbd class="pa-3">{{ item.cmdline }}</kbd>
              </pre>
          </v-card-text>
        </v-card>
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
      <template #page-text="{ pageStart, pageStop, itemsLength }">
        {{ $t('paging.count', { pageStart, pageStop, itemsLength }) }}
      </template>
    </v-data-table>

    <AddRuleForProcessDialog
      v-if="addRuleForProcessDialog"
      :Host="Host"
      @on-create="onAddRuleForProcess"
    />
  </div>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import HelpTooltip from '@/components/App/HelpTooltip';
  import AddRuleForProcessDialog from '@/components/Hosts/Processes/AddRuleForProcessDialog';

  import useDateTime from '@/mixins/useDateTime';
  import useFrontendFilter from '@/mixins/useFrontendFilter';
  import hyperVMetricsMixins from '@/mixins/hyperVMetrics';

  export default {
    components: {
      HelpTooltip,
      AddRuleForProcessDialog,
    },
    mixins: [
      useDateTime,
      useFrontendFilter,
      hyperVMetricsMixins,
    ],
    props: {
      items: {
        type: Array,
        required: true,
      },
      Host: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        search: '',
        searchColumns: ['name'],
        selectedRule: {},
        showKernelTasks: false,
        headers: [
          {
            text: this.$options.filters.capitalize(this.$t('phrase.pid')),
            align: 'left',
            value: 'pid',
            width: '60px',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.name', 1)),
            align: 'left',
            value: 'name',
            width: '300px',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.ppid')),
            align: 'left',
            value: 'parent_pid',
            width: '60px',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.state')),
            align: 'left',
            value: 'state',
            width: '108px',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(
              `${this.$t('phrase.memory')} (${this.$t('phrase.percent')})`,
            ),
            align: 'left',
            value: 'memory_usage_percent',
            width: '60px',
            sortable: true,
          },
          {
            text: this.$options.filters.capitalize(
              this.$tc('phrase.commandLine'),
            ),
            align: 'left',
            value: 'cmdline',
            sortable: true,
          },
          {
            text: '',
            width: '1%',
            align: 'right',
            value: null,
            sortable: false,
          },
        ],
        pagination: {
          sortBy: 'pid',
        },
        rowsPerPage: [25, 50, { text: this.$t('phrase.all'), value: -1 }],
      };
    },
    computed: {
      ...mapState('hosts', ['addRuleForProcessDialog']),
      hostOSKernel() {
        let result = 'linux'; // default to linux

        if (this.Host.inventory && this.Host.inventory['system.os_kernel']) {
          result = this.Host.inventory['system.os_kernel'];
        }

        return result;
      },
      systemPID() {
        if (this.hostOSKernel === 'windows') {
          const systemProcess = this.items.find(item => item.name.toLowerCase() === 'services.exe');

          if (systemProcess) return systemProcess.pid;
        }

        return 0; // default to linux
      },
      showKernelTasksLabel() {
        switch (this.hostOSKernel) {
          case 'linux':
            return this.$t('host.showKernelTasks');
          case 'windows':
            return this.$t('host.showServiceHostProcesses');
          default:
            return this.$t('host.showKernelTasks');
        }
      },
      filteredItems() {
        let { items } = this;

        if (!this.showKernelTasks) {
          items = items.filter(item => (
            item.pid !== this.systemPID && item.parent_pid !== this.systemPID
          ));
        }

        return items;
      },
    },
    methods: {
      ...mapMutations('hosts', ['setSelectedProcessForNewRule', 'toggleAddRuleForProcessDialog']),
      stateColor(state) {
        if (state.toLowerCase() === 'running') return 'success';

        return 'primary';
      },
      createRuleForProcess(item) {
        this.setSelectedProcessForNewRule(Object.assign({}, item));
        this.toggleAddRuleForProcessDialog();
      },
      onAddRuleForProcess({ success = true }) {
        if (success) {
          this.$flash.success(this.$t('message.success.ruleAddFromWizardSuccess'));
          this.toggleAddRuleForProcessDialog();
        } else {
          this.$flash.error(this.$t('message.error.ruleAdd'));
        }
      },
    },
  };
</script>

<style lang="stylus" scoped>
  .codeDisplay
    padding: 6px
    white-space: normal;
    overflow: auto

    kbd
      width: 100%
</style>
