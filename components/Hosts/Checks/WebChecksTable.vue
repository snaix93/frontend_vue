<template>
  <div class="checks-table">

    <CheckSearchPanel
      v-model="filters.search"
      :total-count="totalCount"
      :search-by="['path', 'protocol', 'port', 'check interval', 'http status', 'method']"
    />

    <div class="position-relative">
      <v-data-table
        :headers="headers"
        :hide-actions="totalCount < 11"
        :items="webChecks"
        :pagination.sync="pagination"
        :rows-per-page-items="rowsPerPage"
        :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
        :total-items="totalCount"
        disable-initial-sort
        item-key="id"
      >
        <template #items="{ item: WebCheck }">
          <tr :class="{'is-selected': $wait.is(waitDeleteKeys(WebCheck))}">
            <td class="px-4">
              <CheckIcon :check="WebCheck"/>
            </td>
            <td class="px-2">
              <StringPreview
                :cut-off-characters="44"
                :value="fullCheckEndpoint(WebCheck)"
                cut-off="278px"
              />
            </td>
            <td class="px-2">
              <StringPreview
                v-if="WebCheck.expectedPattern"
                :value="WebCheck.expectedPattern"
                cut-off="110px"
              />
            </td>
            <td class="px-2">
              {{ readableTime(WebCheck.checkInterval) }}
            </td>
            <td class="px-2">
              {{ headerCount(WebCheck) }}
            </td>
            <td class="px-2">
              <v-switch
                v-model="WebCheck.active"
                class="pt-0"
                hide-details
                @change="toggleActiveFlag(WebCheck)"
              />
            </td>
            <td class="px-2 text-no-wrap text-xs-right">
              <v-btn
                :disabled="$wait.is(waitDeleteKeys(WebCheck))"
                class="mx-0 qa-edit"
                color="secondary"
                flat
                icon
                @click.native.stop="editCheck(WebCheck)"
              >
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn
                :disabled="$wait.is(waitDeleteKeys(WebCheck))"
                class="mx-0 qa-delete"
                icon
                @click.native.stop="deleteWithConfirmation(WebCheck)"
              >
                <v-icon
                  v-if="$wait.is(waitDeleteKeys(WebCheck))"
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

    <WebCheckDeleteDialog
      v-if="deleteDialog"
      @on-delete="onDelete"
    />
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
  import WebCheckDeleteDialog from '@/components/Hosts/Checks/WebCheckDeleteDialog';
  import CheckSearchPanel from '@/components/Hosts/Checks/CheckSearchPanel';
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import { WebCheckTableRefresherSymbol } from '@/constants/symbols';
  import useWebCheckHelpers from '@/mixins/useWebCheckHelpers';
  import CheckIcon from '@/components/Hosts/Checks/CheckIcon';
  import StringPreview from '@/components/App/StringPreview';
  import TableNoData from '@/components/App/TableNoData';
  import { useRefresher } from '@/use/useRefresher';
  import AppWait from '@/components/App/AppWait';
  import useDateTime from '@/mixins/useDateTime';
  import useFilters from '@/mixins/useFilters';
  import WebCheck from '@/models/WebCheck';

  const WebCheckTableRefresher = useRefresher(WebCheckTableRefresherSymbol);

  export default {
    components: {
      WebCheckDeleteDialog,
      CheckSearchPanel,
      StringPreview,
      TableNoData,
      CheckIcon,
      AppWait,
    },
    mixins: [
      useFilterablePagination,
      useWebCheckHelpers,
      useDateTime,
      useFilters,
    ],
    data() {
      return {
        filters: WebCheck.filters,
        searchColumns: ['port', 'path', 'method', 'expected_string'],
        headers: [
          {
            text: this.$options.filters.capitalize(this.$t('phrase.state')),
            value: null,
            sortable: false,
            width: '40px',
            class: 'px-4',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.url')),
            value: 'url',
            class: 'px-2',
          },
          {
            text: this.$options.filters.capitalize(
              this.$tc('phrase.expected_string'),
            ),
            align: 'left',
            value: 'expected-string',
            class: 'px-2',
          },
          {
            text: this.$options.filters.capitalize(
              this.$t('phrase.check_interval'),
            ),
            align: 'left',
            value: 'check-interval',
            class: 'px-2',
          },
          {
            text: this.$options.filters.capitalize(this.$t('phrase.customHeader')),
            align: 'left',
            value: null,
            sortable: false,
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
      ...mapState('webChecks', [
        'webCheckDialog', 'deleteDialog'
      ]),
      ...mapGetters('webChecks', ['getWebChecksByHost', 'getTotalCountByHost']),
      webChecks() {
        return this.getWebChecksByHost(this.Host);
      },
      totalCount() {
        return this.getTotalCountByHost(this.Host);
      }
    },
    async fetch() {
      await this.filter();
    },
    mounted() {
      WebCheckTableRefresher.refreshRate = 60;
      WebCheckTableRefresher.onRefresh(this.filter);
      WebCheckTableRefresher.start();
    },
    beforeDestroy() {
      WebCheckTableRefresher.stop();
    },
    methods: {
      ...mapMutations('webChecks', [
        'setSelectedWebCheck',
        'toggleWebCheckDialog',
        'toggleDeleteDialog',
      ]),
      ...mapActions('webChecks', {
        getWebChecksAction: 'getWebChecks',
        updateWebCheckAction: 'updateWebCheck'
      }),
      async filter() {
        await this.getWebChecksAction({
          Host: this.Host,
          WebCheck: this.Host.webChecks()
                        .params({ search: this.filters.search })
                        .orderBy(this.filters.sortBy)
                        .page(this.filters.page)
                        .limit(this.filters.limit),
        });
        this.useFilters_initialLoadCompleted();
      },
      async toggleActiveFlag(WebCheck) {
        try {
          await this.updateWebCheckAction({ WebCheck, Host: this.Host });
          this.$emit('on-update', { WebCheck });
        } catch ({ response }) {
          this.$emit('on-update', { WebCheck, success: false });
        }
      },
      fullCheckEndpoint(WebCheck) {
        return `${WebCheck.method} ${WebCheck.protocol}://<span data-truncate style="color: #9e9e9e">${this.Host.connect}</span>${WebCheck.port ? ':' : ''}${WebCheck.port ?? ''}${WebCheck.path}`;
      },
      editCheck(WebCheck) {
        this.setSelectedWebCheck(WebCheck);
        this.toggleWebCheckDialog(true);
      },
      waitDeleteKeys(WebCheck) {
        return [
          this.$WAIT_FOR.WEB_CHECK.DELETE_ID(WebCheck.id),
          this.$WAIT_FOR.WEB_CHECK.CONFIRM_DELETE_ID(WebCheck.id),
        ];
      },
      deleteWithConfirmation(WebCheck) {
        this.setSelectedWebCheck(WebCheck);
        this.toggleDeleteDialog();
      },
      onDelete({ WebCheck, success = true }) {
        this.$emit('on-delete', { WebCheck, success });
      },
      headerCount({ headers }) {
        return !! headers && typeof headers === 'object' ? Object.keys(headers).length : 0;
      },
    },
  };
</script>
