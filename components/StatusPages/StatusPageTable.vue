<template>
  <div id="members-table">
    <v-data-table
      :headers="headers"
      :items="statusPages"
      :pagination.sync="pagination"
      :total-items="totalCount"
      :rows-per-page-items="rowsPerPage"
      :rows-per-page-text="$t('paging.rowsPerPage') | capitalize"
      :hide-actions="numberOfPages <= rowsPerPage[0]"
      item-key="id"
      disable-initial-sort
      data-cy="statusPagesList"
    >
      <template #items="{item: StatusPage}">
        <td class="pr-2">
          <v-tooltip
            right
            :disabled="StatusPage.title.length < titleTruncateLength"
          >
            {{ StatusPage.title }}
            <div slot="activator">
              {{ StatusPage.title | truncate(titleTruncateLength) }}
            </div>
          </v-tooltip>
        </td>
        <td class="text-no-wrap px-2">
          <CopyField
            :to-copy="StatusPage.token"
            :success="isLastCopiedToken(StatusPage)"
            :message="$t('message.success.tokenCopy')"
            @copy="onCopy"
          >
            {{ StatusPage.token }}
          </CopyField>
        </td>
        <td class="px-2">
          <a
            :href="StatusPage.url"
            target="_blank"
            :title="StatusPage.title"
          >{{ StatusPage.url }}</a>
          <i class="ml-1 fas fa-external-link-alt"/>
        </td>
        <td class="text-xs-right px-2">
          <v-btn
            icon
            class="ma-0"
            :title="$t('button.embed') | capitalize"
            @click.native.stop="embedItem(StatusPage)"
          >
            <v-icon small>
              fas fa-code
            </v-icon>
          </v-btn>
          <v-btn
            icon
            class="ma-0"
            :title="$t('button.edit') | capitalize"
            @click.native.stop="editItem(StatusPage)"
          >
            <v-icon>edit</v-icon>
          </v-btn>
          <v-btn
            flat
            icon
            color="error"
            class="ma-0"
            :title="$t('button.deleteStatusPage') | capitalize"
            @click="onDeleteConfirm(StatusPage)"
          >
            <v-icon>
              delete
            </v-icon>
          </v-btn>
        </td>
      </template>
      <template #no-results>
        <div class="text-xs-center">
          {{ $t('message.error.noSearchResults', { term: filters.search }) }}
        </div>
      </template>
      <template #no-data>
        <TableNoData :is-loading="$fetchState.pending"/>
      </template>
    </v-data-table>
    <StatusPageDeleteConfirmDialog
      v-if="deleteDialog"
      @on-delete="onDelete"
    />
  </div>
</template>

<script>
  import {mapActions, mapMutations, mapState} from 'vuex';
  import StatusPage from "@/models/StatusPage";
  import useDateTime from '@/mixins/useDateTime';
  import CopyField from '@/components/App/CopyField';
  import AppConfirmDialog from '@/components/App/AppConfirmDialog';
  import useFilterablePagination from "@/mixins/useFilterablePagination";
  import StatusPageDeleteConfirmDialog from '@/components/StatusPages/StatusPageDeleteConfirmDialog';
  import TableNoData from '@/components/App/TableNoData';

  export default {
    components: {
      TableNoData,
      StatusPageDeleteConfirmDialog,
      AppConfirmDialog,
      CopyField,
    },
    mixins: [
      useDateTime,
      useFilterablePagination,
    ],
    data() {
      return {
        filters: StatusPage.filters,
        headers: [
          {
            text: this.$options.filters.capitalize(this.$t('phrase.title')),
            align: 'left',
            sortable: false,
            value: 'title',
            class: 'pr-2',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.token', 1)),
            align: 'left',
            sortable: false,
            value: 'embed',
            class: 'px-2',
          },
          {
            text: this.$options.filters.capitalize(this.$tc('phrase.url', 1)),
            align: 'left',
            sortable: false,
            value: 'url',
            class: 'px-2',
          },
          {
            text: null,
            align: 'right',
            sortable: false,
            value: null,
            class: 'pl-2',
          },
        ],
        lastCopiedToken: {},
      };
    },
    async fetch() {
      await this.filter();
    },
    computed: {
      ...mapState('statusPages', [
        'statusPages',
        'StatusPage',
        'totalCount',
        'deleteDialog',
        'selectedStatusPage',
      ]),

      numberOfPages() {
        return !!this.statusPages.length;
      },
      titleTruncateLength() {
        return this.$vuetify.breakpoint.xlOnly ? 50 : 20;
      },
    },
    methods: {
      ...mapActions('statusPages', {
        getStatusPagesAction: 'getStatusPages',
        deleteStatusPageAction: 'deleteStatusPage'
      }),
      ...mapMutations('statusPages', [
          'toggleDeleteDialog',
          'setSelectedStatusPage',
          'toggleEmbedCodeDialog',
          'toggleStatusPageDialog',
      ]),
      async filter() {
        await this.getStatusPagesAction({
          StatusPage: StatusPage.filter(this.filters)
        });
      },
      isLastCopiedToken({ token }) {
        return this.lastCopiedToken === token;
      },
      onCopy(token) {
        this.lastCopiedToken = token;
      },
      editItem(StatusPage) {
        this.setSelectedStatusPage(StatusPage);
        this.toggleStatusPageDialog(true);
      },
      embedItem(StatusPage) {
        this.setSelectedStatusPage(StatusPage);
        this.toggleEmbedCodeDialog(true);
      },
      onDeleteConfirm(StatusPage) {
        this.setSelectedStatusPage(StatusPage);
        this.toggleDeleteDialog();
      },
      onDelete() {
        this.$emit('on-delete', {success: true, StatusPage: this.selectedStatusPage});
      },
    },
  };
</script>
