<template>
  <div class="checks-table">

    <CheckSearchPanel
      v-model="filters.search"
      :search-by="['name', 'token', 'expected update interval']"
      :total-count="totalCount"
    />

    <div class="position-relative">
      <v-data-table
        :headers="headers"
        :hide-actions="totalCount < 11"
        :items="customChecks"
        :pagination.sync="pagination"
        :rows-per-page-items="rowsPerPage"
        :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
        :total-items="totalCount"
        disable-initial-sort
        item-key="id"
      >
        <template #items="{ item: CustomCheck }">
          <tr :class="{'is-selected': $wait.is(waitDeleteKeys(CustomCheck))}">
            <td class="px-4">
              <CheckIcon :check="CustomCheck"/>
            </td>
            <td class="px-2">
              {{ CustomCheck.name }}
            </td>
            <td class="px-2">
              <CopyField
                :success="isLastCopiedToken(CustomCheck)"
                :to-copy="CustomCheck.token"
                @copy="onCopy"
              >
                {{ CustomCheck.token }}
              </CopyField>
            </td>
            <td class="px-2">
              <template v-if="CustomCheck.expectedUpdateInterval">
                {{ readableTimeLong(CustomCheck.expectedUpdateInterval) }}
              </template>

              <template v-else>
                {{ $t('checks.noExpectedUpdateInterval') }}
              </template>
            </td>
            <td class="px-2 text-no-wrap text-xs-right">
              <v-btn
                :disabled="$wait.is(waitDeleteKeys(CustomCheck))"
                class="mx-0 qa-edit"
                color="secondary"
                flat
                icon
                @click.native.stop="editCheck(CustomCheck)"
              >
                <v-icon>edit</v-icon>
              </v-btn>
              <v-btn
                :disabled="$wait.is(waitDeleteKeys(CustomCheck))"
                class="mx-0 qa-delete"
                icon
                @click.native.stop="deleteWithConfirmation(CustomCheck)"
              >
                <v-icon
                  v-if="$wait.is(waitDeleteKeys(CustomCheck))"
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

    <CustomCheckDeleteDialog
      v-if="deleteDialog"
      @on-delete="onDelete"
    />
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex';
  import CustomCheckDeleteDialog from '@/components/Hosts/Checks/CustomCheckDeleteDialog';
  import CheckSearchPanel from '@/components/Hosts/Checks/CheckSearchPanel';
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import { CustomCheckTableRefresherSymbol } from '@/constants/symbols';
  import CheckIcon from '@/components/Hosts/Checks/CheckIcon';
  import TableNoData from '@/components/App/TableNoData';
  import CopyField from '@/components/App/CopyField';
  import { useRefresher } from '@/use/useRefresher';
  import CustomCheck from '@/models/CustomCheck';
  import useDateTime from '@/mixins/useDateTime';
  import AppWait from '@/components/App/AppWait';
  import useFilters from '@/mixins/useFilters';

  const CustomCheckTableRefresher = useRefresher(CustomCheckTableRefresherSymbol);

  export default {
    components: {
      CustomCheckDeleteDialog,
      CheckSearchPanel,
      TableNoData,
      CopyField,
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
        filters: CustomCheck.filters,
        searchColumns: ['name'],
        lastCopiedToken: {},
        headers: [
          {
            text: this.$options.filters.capitalize(this.$t('phrase.state')),
            value: null,
            sortable: false,
            width: '40px',
            class: 'px-4',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.name', 1)),
            align: 'left',
            value: 'name',
            class: 'px-2',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.token', 1)),
            align: 'left',
            value: 'token',
            class: 'px-2',
          },
          {
            text: this.$options.filters.capitalize(
              this.$tc('phrase.expectedUpdateInterval'),
            ),
            align: 'left',
            value: 'expected-update-interval',
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
      ...mapState('customChecks', [
        'customCheckDialog', 'deleteDialog'
      ]),
      ...mapGetters('customChecks', ['getCustomChecksByHost', 'getTotalCountByHost']),
      customChecks() {
        return this.getCustomChecksByHost(this.Host);
      },
      totalCount() {
        return this.getTotalCountByHost(this.Host);
      }
    },
    async fetch() {
      await this.filter();
    },
    mounted() {
      CustomCheckTableRefresher.refreshRate = 60;
      CustomCheckTableRefresher.onRefresh(this.filter);
      CustomCheckTableRefresher.start();
    },
    beforeDestroy() {
      CustomCheckTableRefresher.stop();
    },
    methods: {
      ...mapMutations('customChecks', [
        'setSelectedCustomCheck',
        'toggleCustomCheckDialog',
        'toggleDeleteDialog'
      ]),
      ...mapActions('customChecks', ['getCustomChecks', 'updateCustomCheck']),
      async filter() {
        await this.getCustomChecks({
          Host: this.Host,
          CustomCheck: this.Host.customChecks()
                           .params({ search: this.filters.search })
                           .orderBy(this.filters.sortBy)
                           .page(this.filters.page)
                           .limit(this.filters.limit),
        });
        this.useFilters_initialLoadCompleted();
      },
      editCheck(CustomCheck) {
        this.setSelectedCustomCheck(CustomCheck);
        this.toggleCustomCheckDialog(true);
      },
      waitDeleteKeys(CustomCheck) {
        return [
          this.$WAIT_FOR.CUSTOM_CHECK.DELETE_ID(CustomCheck.id),
          this.$WAIT_FOR.CUSTOM_CHECK.CONFIRM_DELETE_ID(CustomCheck.id),
        ];
      },
      deleteWithConfirmation(CustomCheck) {
        this.setSelectedCustomCheck(CustomCheck);
        this.toggleDeleteDialog();
      },
      onDelete({ CustomCheck, success = true }) {
        this.$emit('on-delete', { CustomCheck, success });
      },
      isLastCopiedToken({ token }) {
        return this.lastCopiedToken === token;
      },
      onCopy(token) {
        this.lastCopiedToken = token;
      },
    },
  };
</script>
