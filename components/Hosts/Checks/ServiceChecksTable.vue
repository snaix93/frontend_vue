<template>
  <div class="checks-table">

    <CheckSearchPanel
      v-model="filters.search"
      :total-count="totalCount"
      :search-by="['service', 'protocol', 'port', 'check interval']"
    />

    <div class="position-relative">
      <v-data-table
        :headers="headers"
        :hide-actions="totalCount < 11"
        :items="serviceChecks"
        :pagination.sync="pagination"
        :rows-per-page-items="rowsPerPage"
        :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
        :total-items="totalCount"
        disable-initial-sort
        item-key="id"
      >
        <template #items="{ item: ServiceCheck }">
          <tr :class="{'is-selected': $wait.is(waitDeleteKeys(ServiceCheck))}">
            <td :class="'px-4 last-Success-' + ServiceCheck.lastSuccess" data-cy="lastSuccess">
              <CheckIcon :check="ServiceCheck"/>
            </td>
            <td class="px-2">
              {{ ServiceCheck.service }}
            </td>
            <td class="px-2">
              {{ ServiceCheck.protocol }}
            </td>
            <td class="px-2">
              {{ ServiceCheck.port }}
            </td>
            <td class="px-2">
              {{ readableTime(ServiceCheck.checkInterval) }}
            </td>
            <td class="px-2">
              <v-switch
                v-model="ServiceCheck.active"
                class="pt-0"
                hide-details
                @change="toggleActiveFlag(ServiceCheck)"
              />
            </td>
            <td class="px-2 text-no-wrap text-xs-right">
              <v-btn
                v-if="!testForSSLCertificateCheck(ServiceCheck)"
                :disabled="$wait.is(waitDeleteKeys(ServiceCheck))"
                class="mx-0 qa-edit"
                color="secondary"
                flat
                icon
                @click.native.stop="editCheck(ServiceCheck)"
              >
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn
                :disabled="$wait.is(waitDeleteKeys(ServiceCheck))"
                class="mx-0 qa-delete"
                data-cy="deleteIcmpPing"
                icon
                @click.native.stop="deleteWithConfirmation(ServiceCheck)"
              >
                <v-icon
                  v-if="$wait.is(waitDeleteKeys(ServiceCheck))"
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

    <ServiceCheckDeleteDialog
      v-if="deleteDialog"
      @on-delete="onDelete"
    />
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapState, mapMutations } from 'vuex';
  import ServiceCheckDeleteDialog from '@/components/Hosts/Checks/ServiceCheckDeleteDialog';
  import CheckSearchPanel from '@/components/Hosts/Checks/CheckSearchPanel';
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import { ServiceCheckTableRefresherSymbol } from '@/constants/symbols';
  import CheckIcon from '@/components/Hosts/Checks/CheckIcon';
  import serviceCheckMixin from '@/mixins/serviceCheckMixin';
  import TableNoData from '@/components/App/TableNoData';
  import { useRefresher } from '@/use/useRefresher';
  import ServiceCheck from '@/models/ServiceCheck';
  import useDateTime from '@/mixins/useDateTime';
  import AppWait from '@/components/App/AppWait';
  import useFilters from '@/mixins/useFilters';

  const ServiceCheckTableRefresher = useRefresher(ServiceCheckTableRefresherSymbol);

  export default {
    components: {
      ServiceCheckDeleteDialog,
      CheckSearchPanel,
      TableNoData,
      CheckIcon,
      AppWait,
    },
    mixins: [
      useFilterablePagination,
      serviceCheckMixin,
      useDateTime,
      useFilters,
    ],
    data() {
      return {
        filters: ServiceCheck.filters,
        headers: [
          {
            text: this.$options.filters.capitalize(this.$t('phrase.state')),
            value: null,
            sortable: false,
            width: '40px',
            class: 'px-4',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.service')),
            align: 'left',
            value: 'service',
            class: 'px-2',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.protocol')),
            align: 'left',
            value: 'protocol',
            class: 'px-2',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.custom_port')),
            align: 'left',
            value: 'port',
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
      ...mapState('serviceChecks', [
        'serviceCheckDialog', 'deleteDialog'
      ]),
      ...mapGetters('serviceChecks', ['getServiceChecksByHost', 'getTotalCountByHost']),
      serviceChecks() {
        return this.getServiceChecksByHost(this.Host);
      },
      totalCount() {
        return this.getTotalCountByHost(this.Host);
      }
    },
    async fetch() {
      await this.filter();
    },
    mounted() {
      ServiceCheckTableRefresher.refreshRate = 60;
      ServiceCheckTableRefresher.onRefresh(this.filter);
      ServiceCheckTableRefresher.start();
    },
    beforeDestroy() {
      ServiceCheckTableRefresher.stop();
    },
    methods: {
      ...mapMutations('serviceChecks', [
        'setSelectedServiceCheck',
        'toggleServiceCheckDialog',
        'toggleICMPCheckDialog',
        'toggleDeleteDialog'
      ]),
      ...mapActions('serviceChecks', ['getServiceChecks', 'updateServiceCheck']),
      async filter() {
        await this.getServiceChecks({
          Host: this.Host,
          ServiceCheck: this.Host.serviceChecks()
                            .params({ search: this.filters.search })
                            .orderBy(this.filters.sortBy)
                            .page(this.filters.page)
                            .limit(this.filters.limit),
        });
        this.useFilters_initialLoadCompleted();
      },
      async toggleActiveFlag(ServiceCheck) {
        try {
          await this.updateServiceCheck({ ServiceCheck, Host: this.Host });
          this.$emit('on-update', { ServiceCheck });
        } catch ({ response }) {
          this.$emit('on-update', { ServiceCheck, success: false });
        }
      },
      editCheck(ServiceCheck) {
        this.setSelectedServiceCheck(ServiceCheck);
        if (ServiceCheck.isIcmpCheck) {
          this.toggleICMPCheckDialog(true);
        } else {
          this.toggleServiceCheckDialog(true);
        }
      },
      waitDeleteKeys(ServiceCheck) {
        return [
          this.$WAIT_FOR.SERVICE_CHECK.DELETE_ID(ServiceCheck.id),
          this.$WAIT_FOR.SERVICE_CHECK.CONFIRM_DELETE_ID(ServiceCheck.id),
        ];
      },
      deleteWithConfirmation(ServiceCheck) {
        this.setSelectedServiceCheck(ServiceCheck);
        this.toggleDeleteDialog();
      },
      onDelete({ ServiceCheck, success = true }) {
        this.$emit('on-delete', { ServiceCheck, success });
      },
    },
  };
</script>
