<template>
  <div class="checks-table">

    <CheckSearchPanel
      v-model="filters.search"
      :search-by="['preset', 'check interval']"
      :total-count="totalCount"
    />

    <div class="position-relative">
      <v-data-table
        :headers="headers"
        :hide-actions="totalCount < 11"
        :items="snmpChecks"
        :pagination.sync="pagination"
        :rows-per-page-items="rowsPerPage"
        :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
        :total-items="totalCount"
        disable-initial-sort
        item-key="id"
      >
        <template #items="{ item: SnmpCheck }">
          <tr :class="{'is-selected': $wait.is(waitDeleteKeys(SnmpCheck))}">
            <td class="px-4">
              <CheckIcon :check="SnmpCheck"/>
            </td>
            <td class="px-2">
              {{ SnmpCheck.preset }}
            </td>
            <td class="px-2">
              {{ readableTime(SnmpCheck.checkInterval) }}
            </td>
            <td class="px-2">
              <v-switch
                v-model="SnmpCheck.active"
                class="pt-0"
                hide-details
                @change="toggleActiveFlag(SnmpCheck)"
              />
            </td>
            <td class="px-2 text-no-wrap text-xs-right">
              <v-btn
                :disabled="$wait.is(waitDeleteKeys(SnmpCheck))"
                class="mx-0 qa-edit"
                color="secondary"
                flat
                icon
                @click.native.stop="editCheck(SnmpCheck)"
              >
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn
                :disabled="$wait.is(waitDeleteKeys(SnmpCheck))"
                class="mx-0 qa-delete"
                icon
                @click.native.stop="deleteWithConfirmation(SnmpCheck)"
              >
                <v-icon
                  v-if="$wait.is(waitDeleteKeys(SnmpCheck))"
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
            </td>
          </tr>
        </template>
        <template #no-data>
          <TableNoData :is-loading="$fetchState.pending"/>
        </template>
        <template #no-results>
          <div class="text-xs-center">
            {{ $t('message.error.noSearchResults', { term: filters.search }) }}
          </div>
        </template>
        <template #page-text="{ pageStart, pageStop, itemsLength }">
          {{ $t('paging.count', { pageStart, pageStop, itemsLength }) }}
        </template>
      </v-data-table>
      <AppWait
        :hide-message="true"
        :wait="useFilters_initialLoadComplete && $fetchState.pending"
        height="100%"
      />
    </div>

    <SNMPCheckDeleteDialog
      v-if="deleteDialog"
      @on-delete="onDelete"
    />
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
  import SNMPCheckDeleteDialog from '@/components/Hosts/Checks/SNMPCheckDeleteDialog';
  import CheckSearchPanel from '@/components/Hosts/Checks/CheckSearchPanel';
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import { SnmpCheckTableRefresherSymbol } from '@/constants/symbols';
  import CheckIcon from '@/components/Hosts/Checks/CheckIcon';
  import TableNoData from '@/components/App/TableNoData';
  import { useRefresher } from '@/use/useRefresher';
  import useDateTime from '@/mixins/useDateTime';
  import AppWait from '@/components/App/AppWait';
  import useFilters from '@/mixins/useFilters';
  import SnmpCheck from '@/models/SnmpCheck';

  const SnmpCheckTableRefresher = useRefresher(SnmpCheckTableRefresherSymbol);

  export default {
    components: {
      SNMPCheckDeleteDialog,
      CheckSearchPanel,
      TableNoData,
      CheckIcon,
      AppWait,
    },
    mixins: [
      useFilterablePagination,
      useDateTime,
      useFilters,
    ],
    data() {
      return {
        filters: SnmpCheck.filters,
        searchColumns: ['name'],
        headers: [
          {
            text: this.$options.filters.capitalize(this.$t('phrase.state')),
            value: null,
            sortable: false,
            width: '40px',
            class: 'px-4',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.preset')),
            align: 'left',
            value: 'preset',
            class: 'px-2',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.check_interval')),
            align: 'left',
            value: 'check-interval',
            class: 'px-2',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.active')),
            align: 'left',
            value: null,
            sortable: false,
            class: 'px-2',
          },
          {
            text: null, align: 'right', sortable: false, class: 'px-2',
          },
        ],
      };
    },
    computed: {
      ...mapState('hosts', ['Host']),
      ...mapState('SNMPChecks', [
        'snmpCheckDialog', 'deleteDialog'
      ]),
      ...mapGetters('SNMPChecks', ['getSnmpChecksByHost', 'getTotalCountByHost']),
      snmpChecks() {
        return this.getSnmpChecksByHost(this.Host);
      },
      totalCount() {
        return this.getTotalCountByHost(this.Host);
      }
    },
    async fetch() {
      await this.filter();
    },
    mounted() {
      SnmpCheckTableRefresher.refreshRate = 60;
      SnmpCheckTableRefresher.onRefresh(this.filter);
      SnmpCheckTableRefresher.start();
    },
    beforeDestroy() {
      SnmpCheckTableRefresher.stop();
    },
    methods: {
      ...mapMutations('SNMPChecks', [
        'setSelectedSnmpCheck',
        'toggleSnmpCheckDialog',
        'toggleDeleteDialog'
      ]),
      ...mapActions('SNMPChecks', ['getSnmpChecks', 'updateSnmpCheck']),
      async filter() {
        await this.getSnmpChecks({
          Host: this.Host,
          SnmpCheck: this.Host.snmpChecks()
                         .params({ search: this.filters.search })
                         .orderBy(this.filters.sortBy)
                         .page(this.filters.page)
                         .limit(this.filters.limit),
        });
        this.useFilters_initialLoadCompleted();
      },
      async toggleActiveFlag(SnmpCheck) {
        try {
          await this.updateSnmpCheck({ SnmpCheck, Host: this.Host });
          this.$emit('on-update', { SnmpCheck });
        } catch ({ response }) {
          this.$emit('on-update', { SnmpCheck, success: false });
        }
      },
      editCheck(SnmpCheck) {
        this.setSelectedSnmpCheck(SnmpCheck);
        this.toggleSnmpCheckDialog(true);
      },
      waitDeleteKeys(SnmpCheck) {
        return [
          this.$WAIT_FOR.SNMP_CHECK.DELETE_ID(SnmpCheck.id),
          this.$WAIT_FOR.SNMP_CHECK.CONFIRM_DELETE_ID(SnmpCheck.id),
        ];
      },
      deleteWithConfirmation(SnmpCheck) {
        this.setSelectedSnmpCheck(SnmpCheck);
        this.toggleDeleteDialog();
      },
      onDelete({ SnmpCheck, success = true }) {
        this.$emit('on-delete', { SnmpCheck, success });
      },
    },
  };
</script>
