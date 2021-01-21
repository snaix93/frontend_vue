<template>
  <v-flex data-cy="hostsList">
    <v-card>
      <v-card-text class="pt-1">
        <v-layout
          align-end justify-end pb-3
          wrap
        >
          <v-flex
            v-if="$teamSettings.get('subUnitManagementEnabled')"
            md3 xs12
          >
            <SubUnitSelect
              v-model="filters.subUnit"
              :sub-units="subUnits"
            />
          </v-flex>
          <SearchBox
            v-model="filters.search"
            :search-by="['name', 'connect', 'description']"
          />
        </v-layout>
      </v-card-text>
      <v-divider/>
      <div class="position-relative">
        <v-data-table
          :headers="filteredHeaders"
          :items="hosts"
          :pagination.sync="pagination"
          :rows-per-page-items="rowsPerPage"
          :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
          :total-items="totalCount"
          class="qa-hosts-tbl host-table"
          data-cy="hostsList"
          item-key="id"
        >
          <template #items="{ item: Host }">
            <tr
              :class="{'is-selected': $wait.is($WAIT_FOR.HOST.ALL_ID(Host.id))}"
              class="host-table-row"
            >
              <td
                v-if="columnIsEnabled('name')"
                :data-cy="Host.name"
                class="pl-3 pr-2 qa-hosts-tbl-name"
              >
                <nuxt-link
                  v-if="$auth.user.isNotReadOnly()"
                  :to="`/hosts/${Host.id}`"
                  class="text--primary no-text-decoration"
                >
                  {{ Host.name }}
                </nuxt-link>
                <span v-else>
                  {{ Host.name }}
                </span>
              </td>
              <td
                v-if="columnIsEnabled('connectionStatus')"
                class="px-2"
              >
                <v-layout align-center>
                  <v-flex xs6>
                    <HostLocationIcon :Host="Host"/>
                  </v-flex>
                  <v-flex xs6>
                    <HostCagentIcon
                      :Host="Host"
                      check-for-update
                      use-last-update-time
                      @click="showHostInventory(Host)"
                    />
                  </v-flex>
                </v-layout>
              </td>
              <td
                v-if="columnIsEnabled('connect')"
                class="px-2"
              >
                {{ Host.connect }}
              </td>
              <td
                v-if="columnIsEnabled('subUnit') && $teamSettings.subUnitManagementEnabled"
                class="px-2"
              >
                <SubUnitIcon
                  v-if="Host.hasSubUnit"
                  :short-id="Host.subUnit.shortId"
                />
              </td>
              <td
                v-if="columnIsEnabled('check')"
                class="px-2"
              >
                {{ Host.totalCheckCount }}
              </td>
              <td
                v-if="columnIsEnabled('description')"
                class="px-2"
              >
                {{ Host.description }}
              </td>
              <td
                v-if="columnIsEnabled('tag')"
                class="px-2"
              >
                <span
                  v-for="(value, index) in Host.tags"
                  :key="index"
                >
                  <span v-if="index !== 0">,</span>
                  {{ value }}
                </span>
              </td>
              <td
                v-if="columnIsEnabled('alerting')"
                class="px-2"
              >
                <v-tooltip top>
                  <v-flex
                    slot="activator"
                    pa-0
                  >
                    <v-switch
                      v-model="Host.alerting"
                      :disabled="$auth.user.isReadOnly() || $wait.is($WAIT_FOR.HOST.ALL_ID(Host.id))"
                      class="qa-mute-alerts my-0 py-0"
                      hide-details
                      @change="host_toggleAlerting(Host)"
                    />
                  </v-flex>
                  <div v-if="Host.muted">
                    {{ $t('host.alertingIsMuted') }}
                  </div>
                  <div v-else>
                    {{ $t('host.alertingIsActive') }}
                  </div>
                </v-tooltip>
              </td>
              <td
                v-if="columnIsEnabled('dashboard')"
                class="px-2"
              >
                <v-tooltip top>
                  <v-flex
                    slot="activator"
                    pa-0
                  >
                    <v-switch
                      v-model="Host.dashboard"
                      :disabled="$auth.user.isReadOnly() || $wait.is($WAIT_FOR.HOST.ALL_ID(Host.id))"
                      class="qa-switch-dashboard my-0 py-0"
                      hide-details
                      @change="host_toggleDashboardVisibility(Host)"
                    />
                  </v-flex>
                  <div v-if="Host.dashboard">
                    {{ $t('host.isShownOnDashboard') }}
                  </div>
                  <div v-else>
                    {{ $t('host.isNotShownOnDashboard') }}
                  </div>
                </v-tooltip>
              </td>
              <td class="pl-2 pr-3 text-no-wrap text-xs-right">
                <template v-if="$vuetify.breakpoint.mdAndUp">
                  <v-btn
                    :disabled="$wait.is($WAIT_FOR.HOST.ALL_ID(Host.id))"
                    :title="$t('button.goToLatestData') | capitalize"
                    class="mx-0"
                    icon
                    @click="host_goToLatestData(Host)"
                  >
                    <v-icon class="secondary--text">
                      bar_chart
                    </v-icon>
                  </v-btn>
                  <template v-if="$auth.user.isNotReadOnly()">
                    <v-btn
                      v-if="!Host.hasChecks"
                      :class="{ 'animated tada infinite slow': !$wait.is($WAIT_FOR.HOST.ALL_ID(Host.id)) }"
                      :color="$wait.is($WAIT_FOR.HOST.ALL_ID(Host.id)) ? 'grey' :'orange'"
                      class="mt-1"
                      dark
                      depressed
                      small
                      @click="host_goToHost(Host)"
                    >
                      {{ $t('host.addCheck') }}
                    </v-btn>
                    <v-btn
                      v-else
                      :disabled="$wait.is($WAIT_FOR.HOST.ALL_ID(Host.id))"
                      :title="$t('button.goToHostSettings') | capitalize"
                      class="mx-0"
                      icon
                      @click="host_goToHost(Host)"
                    >
                      <v-icon class="secondary--text">
                        settings
                      </v-icon>
                    </v-btn>
                    <v-btn
                      :data-cy="`confirmDelete${Host.name}`"
                      :disabled="$wait.is($WAIT_FOR.HOST.ALL_ID(Host.id))"
                      :loading="$wait.is($WAIT_FOR.HOST.DELETE_ID(Host.id))"
                      :title="$t('button.delete') | capitalize"
                      class="mx-0"
                      icon
                      @click="deleteWithConfirmation(Host)"
                    >
                      <v-icon
                        v-if="$wait.is($WAIT_FOR.HOST.CONFIRM_DELETE_ID(Host.id))"
                        color="grey"
                      >
                        delete_forever
                      </v-icon>
                      <v-icon
                        v-else
                        color="error"
                      >
                        delete
                      </v-icon>
                    </v-btn>
                  </template>
                </template>
                <template v-else>
                  <v-layout align-center>
                    <v-flex shrink>
                      <v-menu
                        bottom
                        left
                      >
                        <v-btn
                          slot="activator"
                          class="mx-0 my-0"
                          icon
                          transition="scale-transition"
                        >
                          <v-icon>more_vert</v-icon>
                        </v-btn>

                        <v-list dense>
                          <v-list-tile
                            :disabled="$wait.is($WAIT_FOR.HOST.ALL_ID(Host.id))"
                            @click="host_goToLatestData(Host)"
                          >
                            <v-list-tile-action>
                              <v-icon class="secondary--text">
                                bar_chart
                              </v-icon>
                            </v-list-tile-action>
                            <v-list-tile-title>
                              {{ $t('button.goToLatestData') | capitalize }}
                            </v-list-tile-title>
                          </v-list-tile>
                          <template v-if="$auth.user.isNotReadOnly()">
                            <v-list-tile
                              v-if="!Host.hasChecks"
                              :disabled="$wait.is($WAIT_FOR.HOST.ALL_ID(Host.id))"
                              @click="host_goToHost(Host)"
                            >
                              <v-list-tile-action>
                                <v-btn
                                  :disabled="$wait.is($WAIT_FOR.HOST.ALL_ID(Host.id))"
                                  class="mt-1"
                                  color="orange"
                                  dark
                                  depressed
                                  small
                                  @click="host_goToHost(Host)"
                                >
                                  {{ $t('host.addCheck') }}
                                </v-btn>
                              </v-list-tile-action>
                            </v-list-tile>
                            <v-list-tile
                              v-else
                              :disabled="$wait.is($WAIT_FOR.HOST.ALL_ID(Host.id))"
                              @click="host_goToHost(Host)"
                            >
                              <v-list-tile-action>
                                <v-icon class="secondary--text">
                                  settings
                                </v-icon>
                              </v-list-tile-action>
                              <v-list-tile-title>
                                {{ $t('button.goToHostSettings') | capitalize }}
                              </v-list-tile-title>
                            </v-list-tile>
                            <v-list-tile
                              :disabled="$wait.is($WAIT_FOR.HOST.ALL_ID(Host.id))"
                              :loading="$wait.is($WAIT_FOR.HOST.DELETE_ID(Host.id))"
                              @click="deleteWithConfirmation(Host)"
                            >
                              <v-list-tile-action>
                                <v-icon
                                  v-if="$wait.is($WAIT_FOR.HOST.CONFIRM_DELETE_ID(Host.id))"
                                  color="grey"
                                >
                                  delete_forever
                                </v-icon>
                                <v-icon
                                  v-else
                                  color="error"
                                >
                                  delete
                                </v-icon>
                              </v-list-tile-action>
                              <v-list-tile-title>
                                {{ $t('button.delete') | capitalize }}
                              </v-list-tile-title>
                            </v-list-tile>
                          </template>
                        </v-list>
                      </v-menu>
                    </v-flex>
                  </v-layout>
                </template>
              </td>
            </tr>
          </template>
          <template #no-results>
            <div class="text-xs-center">
              {{ $t('message.error.noSearchResults', { term: filters.search }) }}
            </div>
          </template>
          <template #no-data>
            <TableNoData :is-loading="$fetchState.pending"/>
          </template>
          <template #page-text="{ pageStart, pageStop, itemsLength }">
            {{ $t('paging.count', { pageStart, pageStop, itemsLength }) }}
          </template>
          <template #actions-append>
            <v-layout row>
              <v-flex shrink>
                <v-btn
                  class="qa-btn-reload-hosts mr-0"
                  color="grey darken-2"
                  outline
                  small
                  @click="reload"
                >
                  <v-icon small>
                    autorenew
                  </v-icon>
                  <span class="ml-2">{{ $t('host.reloadData') }}</span>
                </v-btn>
              </v-flex>
              <v-flex shrink>
                <v-btn
                  class="qa-btn-customize ml-0"
                  color="grey darken-2"
                  outline
                  small
                  @click="toggleCustomizeHostTablePanel"
                >
                  <v-icon
                    v-if="!showCustomizeHostTablePanel"
                    small
                  >
                    fas fa-table
                  </v-icon>
                  <v-icon
                    v-else
                    small
                  >
                    fas fa-chevron-up
                  </v-icon>
                  <span class="ml-2">{{ $t('host.customizeTable') }}</span>
                </v-btn>
              </v-flex>
            </v-layout>
          </template>
        </v-data-table>
        <AppWait
          :hide-message="true"
          :wait="useFilters_initialLoadComplete && $fetchState.pending"
          height="100%"
        />
      </div>

      <CustomiseDataTable
        v-model="showCustomizeHostTablePanel"
        :headers="filterHeaders(headers)"
      />

      <HostDeleteConfirmDialog
        v-if="deleteDialog"
        @on-delete="onDelete"
      />

      <HostInventoryDialog v-if="inventoryDialog"/>
    </v-card>
  </v-flex>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import HostDeleteConfirmDialog from '@/components/Hosts/HostDeleteConfirmDialog';
  import HostInventoryDialog from '@/components/Hosts/HostInventoryDialog';
  import CustomiseDataTable from '@/components/Hosts/CustomiseDataTable';
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import HostLocationIcon from '@/components/Hosts/HostLocationIcon';
  import usePersistableFilters from '@/mixins/usePersistableFilters';
  import SubUnitSelect from '@/components/SubUnits/SubUnitSelect';
  import HostCagentIcon from '@/components/Hosts/HostCagentIcon';
  import { HostTableRefresherSymbol } from '@/constants/symbols';
  import SubUnitIcon from '@/components/SubUnits/SubUnitIcon';
  import TableNoData from '@/components/App/TableNoData';
  import SearchBox from '@/components/Form/SearchBox';
  import { useRefresher } from '@/use/useRefresher';
  import AppWait from '@/components/App/AppWait';
  import useFilters from '@/mixins/useFilters';
  import hostMixins from '@/mixins/host';
  import userMixins from '@/mixins/user';
  import Host from '@/models/Host';

  const HostTableRefresher = useRefresher(HostTableRefresherSymbol);

  export default {
    components: {
      HostDeleteConfirmDialog,
      HostInventoryDialog,
      CustomiseDataTable,
      HostLocationIcon,
      HostCagentIcon,
      SubUnitSelect,
      SubUnitIcon,
      TableNoData,
      SearchBox,
      AppWait,
    },
    mixins: [
      useFilterablePagination,
      usePersistableFilters,
      hostMixins,
      userMixins,
      useFilters,
    ],
    async fetch() {
      this.setLastUpdateTime(null);
      await this.filter();
    },
    data() {
      return {
        filters: Host.filters,
        persistableFilterKey: Host.persistableFilterKey,
        headers: [
          {
            text: this.$tc('phrase.name', 1),
            align: 'left',
            value: 'name',
            class: 'pl-3 pr-2',
            customizeOptions: {
              key: 'name',
              enabled: true,
              text: this.$tc('phrase.name', 1),
            },
          },
          {
            text: '',
            align: 'left',
            value: 'connectionStatus',
            class: 'pl-0 pr-2',
            customizeOptions: {
              key: 'connectionStatus',
              enabled: true,
              text: this.$tc('phrase.connectionStatus', 1),
            },
          },
          {
            text: this.$t('phrase.connect'),
            align: 'left',
            value: 'connect',
            class: 'px-2',
            customizeOptions: {
              key: 'connect',
              enabled: true,
              text: this.$t('phrase.connect'),
            },
          },
          {
            text: this.$t('phrase.subUnit'),
            align: 'left',
            value: 'subUnit',
            sortable: false,
            class: 'px-2',
            customizeOptions: {
              key: 'subUnit',
              enabled: true,
              text: this.$t('phrase.subUnit'),
            },
          },
          {
            text: this.$tc('phrase.check', 2),
            align: 'left',
            value: 'checks-count',
            class: 'px-2',
            customizeOptions: {
              key: 'check',
              enabled: true,
              text: this.$tc('phrase.check', 2),
            },
          },
          {
            text: this.$t('phrase.description'),
            align: 'left',
            value: 'description',
            class: 'px-2',
            customizeOptions: {
              key: 'description',
              enabled: true,
              text: this.$t('phrase.description'),
            },
          },
          {
            text: this.$tc('phrase.tag', 2),
            align: 'left',
            value: 'tags',
            sortable: false,
            class: 'px-2',
            customizeOptions: {
              key: 'tag',
              enabled: true,
              text: this.$tc('phrase.tag', 2),
            },
          },
          {
            text: this.$t('phrase.alerting'),
            align: 'left',
            value: 'alerting',
            sortable: false,
            class: 'px-2',
            customizeOptions: {
              key: 'alerting',
              enabled: true,
              text: this.$t('phrase.alerting'),
            },
          },
          {
            text: this.$t('phrase.showOnDashboard'),
            align: 'left',
            value: 'dashboard',
            sortable: false,
            class: 'px-2',
            customizeOptions: {
              key: 'dashboard',
              enabled: true,
              text: this.$t('phrase.showOnDashboard'),
            },
          },
          {
            text: '',
            align: 'right',
            value: '',
            sortable: false,
            class: 'pl-2 pr-3',
          },
        ],
        showCustomizeHostTablePanel: false,
      };
    },
    computed: {
      ...mapState('hosts', [
        'hosts', 'Host', 'selectedHost', 'totalCount',
        'inventoryDialog', 'deleteDialog',
      ]),
      ...mapState('subUnits', ['subUnits']),
      filteredHeaders() {
        return this
          .filterHeaders(this.headers)
          .filter(header => ! header.customizeOptions || header.customizeOptions.enabled)
          .map((header) => {
            header.text = this.$options.filters.capitalize(header.text);
            return header;
          });
      },
    },
    async created() {
      if (this.$teamSettings.get('subUnitManagementEnabled')) {
        await this.getSubUnits();
      }
    },
    mounted() {
      HostTableRefresher.refreshRate = 60;
      HostTableRefresher.onRefresh(this.filter);
      HostTableRefresher.start();
    },
    beforeDestroy() {
      HostTableRefresher.stop();
    },
    methods: {
      ...mapActions('hosts', ['getHosts']),
      ...mapMutations('hosts', [
        'setHost', 'setSelectedHost',
        'toggleInventoryDialog', 'toggleDeleteDialog',
      ]),
      ...mapActions('subUnits', ['getSubUnits']),
      ...mapMutations('app', ['setLastUpdateTime']),
      async filter() {
        await this.getHosts({
          Host: Host.filter(this.filters)
                    .include('frontman', 'sub-unit')
                    .append('summary'),
        });
        this.useFilters_initialLoadCompleted();
      },
      showHostInventory(Host) {
        this.setHost(Host);
        this.toggleInventoryDialog();
      },
      filterHeaders(headers) {
        return headers.filter((header) => {
          let key = header?.customizeOptions?.key;
          return ! header.customizeOptions
                 || key !== 'subUnit'
                 || (key === 'subUnit' && this.$teamSettings.get('subUnitManagementEnabled'));
        });
      },
      toggleCustomizeHostTablePanel() {
        this.showCustomizeHostTablePanel = ! this.showCustomizeHostTablePanel;
      },
      columnIsEnabled(headerKey) {
        return !! this.headers.find(header => header.customizeOptions?.key === headerKey
                                              && header.customizeOptions?.enabled);
      },
      reload() {
        HostTableRefresher.reset();
        this.$fetch();
      },
      deleteWithConfirmation(Host) {
        this.setSelectedHost(Host);
        this.toggleDeleteDialog();
      },
      onDelete({ Host, success = true }) {
        this.reload();
        this.$emit('on-delete', { Host, success });
      },
    },
  };
</script>
