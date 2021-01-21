<template>
  <div id="subUnits-table">
    <v-card>
      <v-card-text class="pt-1">
        <v-layout
          align-end justify-end pb-3
          wrap
        >
          <SearchBox
            v-model="search"
            :search-by="['short ID', 'name']"
          />
        </v-layout>
      </v-card-text>
      <v-divider/>
      <div class="position-relative">
        <v-data-table
          :custom-filter="useFrontendFilter_expressionSearch"
          :headers="headers"
          :hide-actions="subUnits.length < 11"
          :items="subUnits"
          :pagination.sync="pagination"
          :rows-per-page-items="rowsPerPage"
          :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
          :search="search"
          data-cy="subUnitsList"
          disable-initial-sort
          item-key="uuid"
        >
          <template #items="props">
            <td>
              <SubUnitIcon :short-id="props.item.shortId"/>
            </td>
            <td style="max-width:360px">
              <div class="text-truncate">
                {{ props.item.name }}
              </div>
            </td>
            <td class="text-xs-right">
              <v-menu
                bottom
                left
              >
                <v-btn
                  slot="activator"
                  class="mx-0 my-0"
                  data-cy="subUnitActionsButton"
                  icon
                  transition="scale-transition"
                >
                  <v-icon>more_vert</v-icon>
                </v-btn>

                <v-list dense>
                  <v-list-tile
                    class="qa-edit"
                    data-cy="editSubUnitButton"
                    @click="editItem(props.item)"
                  >
                    <v-list-tile-action>
                      <v-icon color="grey darken-3">
                        edit
                      </v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title>
                      {{ $t('button.edit') | capitalize }}
                    </v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile
                    class="qa-delete"
                    data-cy="deleteSubUnitButton"
                    @click="deleteWithConfirmation(props.item)"
                  >
                    <v-list-tile-action>
                      <v-icon color="error">
                        delete
                      </v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title>
                      {{ $t('button.delete') | capitalize }}
                    </v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>
            </td>
          </template>
          <template #no-data>
            <TableNoData :is-loading="$fetchState.pending"/>
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
    </v-card>
    <SubUnitDeleteDialog
      v-if="deleteDialog"
      @on-delete="onDelete"
    />
  </div>
</template>

<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import SubUnitDeleteDialog from '@/components/SubUnits/SubUnitDeleteDialog';
  import useFilterablePagination from '@/mixins/useFilterablePagination';
  import AppConfirmDialog from '@/components/App/AppConfirmDialog';
  import SubUnitIcon from '@/components/SubUnits/SubUnitIcon';
  import useFrontendFilter from '@/mixins/useFrontendFilter';
  import TableNoData from '@/components/App/TableNoData';
  import SearchBox from '@/components/Form/SearchBox';
  import userMixins from '@/mixins/user';

  export default {
    components: {
      SubUnitDeleteDialog,
      AppConfirmDialog,
      TableNoData,
      SubUnitIcon,
      SearchBox,
    },
    mixins: [
      useFilterablePagination,
      useFrontendFilter,
      userMixins
    ],
    data() {
      return {
        search: '',
        selectedSubUnit: {},
        rowsPerPage: [10, 25, 50, { text: this.$t('phrase.all'), value: -1 }],
      };
    },
    computed: {
      ...mapState('subUnits', ['subUnits', 'deleteDialog']),
      headers() {
        return [
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.shortId')),
            align: 'left',
            value: 'shortId',
            width: '80px',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.name')),
            align: 'left',
            value: 'name',
            width: '360px',
          },
          {
            text: null,
            align: 'right',
            value: null,
            sortable: false,
            width: '1%',
          }
        ];
      },
    },
    async fetch() {
      await this.getSubUnits();
    },
    methods: {
      ...mapActions('subUnits', ['getSubUnits']),
      ...mapMutations('subUnits', [
        'setSelectedSubUnit',
        'toggleSubUnitDialog',
        'toggleDeleteDialog'
      ]),
      editItem(subUnit) {
        this.setSelectedSubUnit(subUnit);
        this.toggleSubUnitDialog();
      },
      deleteWithConfirmation(SubUnit) {
        this.setSelectedSubUnit(SubUnit);
        this.toggleDeleteDialog();
      },
      onDelete({ SubUnit, success = true }) {
        this.$emit('on-delete', { SubUnit, success });
      },
    },
  };
</script>
